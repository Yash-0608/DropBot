package com.example.dropbot

import android.content.Context
import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.ServerSocket
import java.net.URL
import java.net.URLDecoder
import java.net.URLEncoder
import java.net.NetworkInterface
import org.json.JSONObject
import java.util.concurrent.Executors
import kotlin.concurrent.thread

data class LaptopPair(val host: String, val port: Int, val token: String)
data class PairResult(val connected: Boolean, val error: String? = null)

object NetworkManager {
    private const val phonePort = 8766
    private var laptop: LaptopPair? = null
    private var server: ServerSocket? = null
    private val uploadExecutor = Executors.newCachedThreadPool()

    fun start(context: Context) {
        if (server != null) return
        val socket = ServerSocket(phonePort)
        server = socket
        thread(name = "dropbot-phone-server", isDaemon = true) {
            while (server === socket) {
                try {
                    val client = socket.accept()
                    uploadExecutor.execute { handleUpload(context, client) }
                } catch (_: java.net.SocketException) {
                    break
                }
            }
        }
    }

    fun stop() {
        server?.close()
        server = null
        laptop = null
    }

    fun pair(context: Context, pair: LaptopPair, name: String): PairResult {
        return try {
            start(context)
            val host = wifiAddress(context)
                ?: return PairResult(false, "The phone is not connected to Wi-Fi.")
            val connection = URL("http://${pair.host}:${pair.port}/pair").openConnection() as HttpURLConnection
            try {
                connection.requestMethod = "POST"
                connection.doOutput = true
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                connection.setRequestProperty("Content-Type", "application/json")
                val body = JSONObject()
                    .put("token", pair.token)
                    .put("name", name.trim().ifEmpty { "DropBot Phone" })
                    .put("host", host)
                    .put("port", phonePort)
                    .toString()
                connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
                val status = connection.responseCode
                if (status !in 200..299) {
                    val details = runCatching {
                        (connection.errorStream ?: connection.inputStream).bufferedReader().readText()
                    }.getOrNull().orEmpty()
                    return PairResult(false, "Laptop rejected pairing (HTTP $status)${if (details.isNotBlank()) ": $details" else "."}")
                }
            } finally {
                connection.disconnect()
            }
            laptop = pair
            PairResult(true)
        } catch (error: Exception) {
            PairResult(false, when {
                error.message?.contains("CLEARTEXT", ignoreCase = true) == true ->
                    "Android blocked local HTTP. Install the latest APK."
                error.message?.contains("timeout", ignoreCase = true) == true ->
                    "Laptop not reachable. Check the same Wi-Fi and Windows Firewall."
                else -> "Could not reach laptop: ${error.message ?: "network error"}"
            })
        }
    }

    fun uploadToLaptop(file: File): Boolean {
        val pair = laptop ?: return false
        val connection = URL("http://${pair.host}:${pair.port}/upload").openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.doOutput = true
        connection.connectTimeout = 5000
        connection.readTimeout = 30000
        connection.setRequestProperty("X-DropBot-Filename", URLEncoder.encode(file.name, "UTF-8"))
        connection.setRequestProperty("X-DropBot-Token", pair.token)
        connection.setFixedLengthStreamingMode(file.length())
        file.inputStream().use { input -> connection.outputStream.use { output -> input.copyTo(output) } }
        val success = connection.responseCode in 200..299
        connection.disconnect()
        return success
    }

    fun unpair() {
        val pair = laptop ?: return
        thread {
            try {
                val connection = URL("http://${pair.host}:${pair.port}/unpair").openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.connectTimeout = 2000
                connection.responseCode
                connection.disconnect()
            } catch (_: Exception) {
            } finally {
                laptop = null
            }
        }
    }

    private fun handleUpload(context: Context, socket: java.net.Socket) {
        socket.use { client ->
            val input = client.getInputStream()
            val headerBytes = readHeaders(input) ?: return
            val headers = headerBytes.toString(Charsets.UTF_8).split("\r\n")
            val length = headers.firstOrNull { it.startsWith("Content-Length:", true) }?.substringAfter(":")?.trim()?.toLongOrNull() ?: return
            val transferToken = headers.firstOrNull { it.startsWith("X-DropBot-Token:", true) }?.substringAfter(":")?.trim()
            val pair = laptop ?: return
            if (transferToken != pair.token) return
            val encodedName = headers.firstOrNull { it.startsWith("X-DropBot-Filename:", true) }?.substringAfter(":")?.trim() ?: "dropbot-file"
            val fileName = URLDecoder.decode(encodedName, "UTF-8")
                .substringAfterLast('/')
                .substringAfterLast('\\')
                .replace(Regex("[\\u0000-\\u001F<>:\"|?*]"), "_")
                .trim()
                .ifBlank { "dropbot-file" }
            val saved = saveToDownloads(context, fileName, input, length) ?: return
            client.getOutputStream().bufferedWriter().use {
                it.write("HTTP/1.1 201 Created\r\nContent-Length: 2\r\nConnection: close\r\n\r\nOK")
            }
        }
    }

    private fun saveToDownloads(
        context: Context,
        fileName: String,
        input: InputStream,
        length: Long
    ): Uri? {
        val safeName = fileName.ifBlank { "dropbot-file" }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val resolver = context.contentResolver
            val values = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, uniqueDownloadName(resolver, safeName))
                put(MediaStore.Downloads.MIME_TYPE, "application/octet-stream")
                put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                put(MediaStore.Downloads.IS_PENDING, 1)
            }
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: return null
            try {
                resolver.openOutputStream(uri)?.use { out ->
                    var remaining = length
                    val buffer = ByteArray(64 * 1024)
                    while (remaining > 0) {
                        val count = input.read(buffer, 0, minOf(buffer.size.toLong(), remaining).toInt())
                        if (count < 0) throw IllegalStateException("Transfer ended before the file was complete")
                        out.write(buffer, 0, count)
                        remaining -= count
                    }
                } ?: throw IllegalStateException("Could not open Downloads")
                resolver.update(uri, ContentValues().apply {
                    put(MediaStore.Downloads.IS_PENDING, 0)
                }, null, null)
                return uri
            } catch (error: Exception) {
                resolver.delete(uri, null, null)
                throw error
            }
        }

        val directory = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        if (!directory.exists() && !directory.mkdirs()) return null
        val output = uniqueOutputFile(directory, safeName)
        FileOutputStream(output).use { out ->
                var remaining = length
                val buffer = ByteArray(64 * 1024)
                while (remaining > 0) {
                    val count = input.read(buffer, 0, minOf(buffer.size.toLong(), remaining).toInt())
                    if (count < 0) throw IllegalStateException("Transfer ended before the file was complete")
                    out.write(buffer, 0, count)
                    remaining -= count
                }
            }
        return Uri.fromFile(output)
    }

    private fun uniqueDownloadName(resolver: android.content.ContentResolver, fileName: String): String {
        val dot = fileName.lastIndexOf('.')
        val stem = if (dot > 0) fileName.substring(0, dot) else fileName
        val extension = if (dot > 0) fileName.substring(dot) else ""
        var candidate = fileName
        var suffix = 1
        while (resolver.query(
                MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                arrayOf(MediaStore.Downloads._ID),
                "${MediaStore.Downloads.DISPLAY_NAME} = ? AND ${MediaStore.Downloads.RELATIVE_PATH} = ?",
                arrayOf(candidate, "${Environment.DIRECTORY_DOWNLOADS}/"),
                null
            )?.use { it.moveToFirst() } == true
        ) {
            candidate = "$stem ($suffix)$extension"
            suffix++
        }
        return candidate
    }

    private fun uniqueOutputFile(directory: File, fileName: String): File {
        val dot = fileName.lastIndexOf('.')
        val stem = if (dot > 0) fileName.substring(0, dot) else fileName
        val extension = if (dot > 0) fileName.substring(dot) else ""
        var candidate = File(directory, fileName)
        var suffix = 1
        while (candidate.exists()) {
            candidate = File(directory, "$stem ($suffix)$extension")
            suffix++
        }
        return candidate
    }

    private fun readHeaders(input: InputStream): ByteArray? {
        val result = java.io.ByteArrayOutputStream()
        val tail = ByteArray(4)
        var tailSize = 0
        while (true) {
            val current = input.read()
            if (current < 0) return null
            result.write(current)
            if (tailSize < 4) {
                tail[tailSize++] = current.toByte()
            } else {
                tail[0] = tail[1]
                tail[1] = tail[2]
                tail[2] = tail[3]
                tail[3] = current.toByte()
            }
            if (tailSize == 4 && tail.contentEquals("\r\n\r\n".toByteArray())) {
                return result.toByteArray()
            }
            if (result.size() > 8192) return null
        }
    }

    private fun wifiAddress(context: Context): String? {
        val candidates = NetworkInterface.getNetworkInterfaces()?.toList().orEmpty()
            .flatMap { it.inetAddresses.toList() }
            .filterIsInstance<java.net.Inet4Address>()
            .filter { !it.isLoopbackAddress && !it.isLinkLocalAddress }
            .mapNotNull { it.hostAddress }
        return candidates.firstOrNull { it.startsWith("10.") || it.startsWith("192.168.") || it.matches(Regex("^172\\.(1[6-9]|2\\d|3[0-1])\\..*")) }
            ?: candidates.firstOrNull()
    }
}

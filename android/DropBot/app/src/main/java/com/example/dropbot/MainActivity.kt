package com.example.dropbot

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.content.Intent
import android.widget.Toast
import android.net.Uri
import android.provider.OpenableColumns
import java.io.File
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.layout.ColumnScope
import com.example.dropbot.ui.theme.DropBotTheme
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions

private val Blue = Color(0xFF168DF5)
private val Ink = Color(0xFF182231)
private val Muted = Color(0xFF718096)
private val Page = Color(0xFFF8FAFC)
private val SoftBlue = Color(0xFFEAF5FF)
private val Green = Color(0xFF16A66A)

private enum class OnboardingScreen {
    Intro, Features, PhoneName, Connect, Scanner, Success, Home
}

private enum class HomeTab {
    Home, History, Devices, Settings
}

class MainActivity : ComponentActivity() {
    private var scannerResult: ((String?) -> Unit)? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DropBotTheme(
                darkTheme = false,
                dynamicColor = false
            ) {
                DropBotApp()
            }
        }
    }
}

@Composable
private fun DropBotApp() {
    var screen by rememberSaveable { mutableStateOf(OnboardingScreen.Intro) }
    var phoneName by rememberSaveable { mutableStateOf("") }
    var tab by rememberSaveable { mutableStateOf(HomeTab.Home) }
    var pairError by rememberSaveable { mutableStateOf("") }
    val context = LocalContext.current
    val filePicker = androidx.activity.compose.rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            Thread {
                val fileName = sourceFileName(context, uri)
                val cached = File(context.cacheDir, fileName)
                val uploaded = try {
                    val input = context.contentResolver.openInputStream(uri)
                        ?: throw IllegalStateException("Could not open the selected file")
                    input.use {
                        cached.outputStream().use { output -> it.copyTo(output) }
                    }

                    NetworkManager.uploadToLaptop(cached)
                } catch (_: Exception) {
                    false
                } finally {
                    cached.delete()
                }
                (context as? MainActivity)?.runOnUiThread {
                    Toast.makeText(context, if (uploaded) "File sent to laptop" else "File transfer failed", Toast.LENGTH_SHORT).show()
                }
            }.start()
        }
    }
    val cameraPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) screen = OnboardingScreen.Scanner
    }

    Surface(modifier = Modifier.fillMaxSize(), color = Page) {
        when (screen) {
            OnboardingScreen.Intro -> IntroScreen { screen = OnboardingScreen.Features }
            OnboardingScreen.Features -> FeaturesScreen(
                onNext = { screen = OnboardingScreen.PhoneName },
                onSkip = { screen = OnboardingScreen.PhoneName }
            )
            OnboardingScreen.PhoneName -> PhoneNameScreen(
                name = phoneName,
                onNameChange = { phoneName = it },
                onContinue = {
                    if (phoneName.isNotBlank()) screen = OnboardingScreen.Connect
                }
            )
            OnboardingScreen.Connect -> ConnectScreen(
                onScan = {
                    if (context.checkSelfPermission(Manifest.permission.CAMERA) ==
                        PackageManager.PERMISSION_GRANTED
                    ) {
                        screen = OnboardingScreen.Scanner
                    } else {
                        cameraPermission.launch(Manifest.permission.CAMERA)
                    }
                },
                onHowToConnect = { screen = OnboardingScreen.Scanner }
            )
            OnboardingScreen.Scanner -> ScannerScreen(
                onBack = { screen = OnboardingScreen.Connect },
                onPaired = { payload ->
                    val parsed = parsePairingPayload(payload)
                    if (parsed == null) {
                        pairError = "This is not a valid DropBot pairing code."
                        screen = OnboardingScreen.Connect
                    } else {
                        Thread {
                            val result = NetworkManager.pair(
                                context,
                                LaptopPair(parsed.host, parsed.port, parsed.token),
                                phoneName.ifBlank { "DropBot Phone" }
                            )
                            (context as? MainActivity)?.runOnUiThread {
                                if (result.connected) {
                                    pairError = ""
                                    screen = OnboardingScreen.Success
                                } else {
                                    pairError = result.error ?: "Laptop was not reachable. Check that both devices use the same Wi-Fi."
                                    screen = OnboardingScreen.Connect
                                }
                            }
                        }.start()
                    }
                },
                error = pairError
            )
            OnboardingScreen.Success -> SuccessScreen(
                phoneName = phoneName.ifBlank { "Your Phone" },
                onContinue = { screen = OnboardingScreen.Home }
            )
            OnboardingScreen.Home -> HomeScreen(
                phoneName = phoneName.ifBlank { "Your Phone" },
                tab = tab,
                onTabChange = { tab = it },
                onSendFile = { filePicker.launch(arrayOf("*/*")) },
                onDisconnect = {
                    NetworkManager.unpair()
                    tab = HomeTab.Home
                    screen = OnboardingScreen.Connect
                }
            )
        }
    }
}

private fun sourceFileName(context: android.content.Context, uri: Uri): String {
    val queriedName = context.contentResolver.query(
        uri,
        arrayOf(OpenableColumns.DISPLAY_NAME),
        null,
        null,
        null
    )?.use { cursor ->
        if (cursor.moveToFirst()) cursor.getString(0) else null
    }
    val fallback = uri.lastPathSegment?.substringAfterLast('/')?.takeIf { it.isNotBlank() } ?: "dropbot-file"
    return (queriedName ?: fallback)
        .replace(Regex("[<>:\"/\\\\|?*\\u0000-\\u001F]"), "_")
        .trim()
        .ifBlank { "dropbot-file" }
}

private data class PairingPayload(val host: String, val port: Int, val token: String)

private fun parsePairingPayload(payload: String): PairingPayload? {
    return try {
        val json = org.json.JSONObject(payload)
        val host = json.getString("host").trim()
        val port = json.getInt("port")
        val token = json.getString("token")
        if (host.isEmpty() || port !in 1..65535 || token.isEmpty()) {
            null
        } else {
            PairingPayload(host, port, token)
        }
    } catch (_: Exception) {
        null
    }
}

@Composable
private fun IntroScreen(onNext: () -> Unit) {
    OnboardingLayout {
        BotMark(modifier = Modifier.size(122.dp))
        Spacer(Modifier.height(28.dp))
        Text("DropBot", fontSize = 30.sp, fontWeight = FontWeight.Bold, color = Ink)
        Spacer(Modifier.height(8.dp))
        Text(
            "Your File Transfer Companion",
            color = Muted,
            fontSize = 14.sp,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(18.dp))
        Text(
            "Send files from your laptop to your phone — instantly, securely, and easily.",
            color = Muted,
            fontSize = 14.sp,
            lineHeight = 21.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(0.82f)
        )
        Spacer(Modifier.weight(1f))
        PrimaryButton("Get Started  →", onNext)
        Spacer(Modifier.height(18.dp))
        StepDots(selected = 0, total = 3)
    }
}

@Composable
private fun FeaturesScreen(onNext: () -> Unit, onSkip: () -> Unit) {
    OnboardingLayout {
        Text("Simple. Fast. Secure.", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Ink)
        Spacer(Modifier.height(8.dp))
        Text("A better way to move files between your devices.", color = Muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(28.dp))
        FeatureCard("⚡", "Fast Transfer", "Send large files up to 2 GB on your local network.")
        FeatureCard("◇", "Secure Connection", "Your one-time QR pairing keeps the connection private.")
        FeatureCard("□", "All Your Files", "Photos, videos, documents, and more.")
        Spacer(Modifier.weight(1f))
        PrimaryButton("Next  →", onNext)
        TextButton(onClick = onSkip) { Text("Skip", color = Muted) }
        StepDots(selected = 1, total = 3)
    }
}

@Composable
private fun PhoneNameScreen(name: String, onNameChange: (String) -> Unit, onContinue: () -> Unit) {
    OnboardingLayout {
        IconBubble("▯")
        Spacer(Modifier.height(22.dp))
        Text("Set Up Your Phone", fontSize = 23.sp, fontWeight = FontWeight.Bold, color = Ink)
        Spacer(Modifier.height(8.dp))
        Text("Give your phone a name to help identify it during pairing.", color = Muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(30.dp))
        OutlinedTextField(
            value = name,
            onValueChange = onNameChange,
            label = { Text("Phone Name") },
            placeholder = { Text("e.g. Yash's Phone") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Text("This name will be shown on your laptop when you connect.", color = Muted, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
        Spacer(Modifier.weight(1f))
        PrimaryButton("Continue  →", onContinue, enabled = name.isNotBlank())
        StepDots(selected = 2, total = 3)
    }
}

@Composable
private fun ConnectScreen(onScan: () -> Unit, onHowToConnect: () -> Unit) {
    OnboardingLayout {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            IconBubble("▱")
            IconBubble("▯")
        }
        Spacer(Modifier.height(22.dp))
        Text("Connect to DropBot", fontSize = 23.sp, fontWeight = FontWeight.Bold, color = Ink)
        Spacer(Modifier.height(8.dp))
        Text("Scan the QR code displayed on your laptop to pair.", color = Muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(28.dp))
        PrimaryButton("▣  Scan QR Code", onScan)
        Spacer(Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            HorizontalDivider(Modifier.weight(1f), color = Color(0xFFD8E0EA))
            Text("  OR  ", color = Muted, fontSize = 12.sp)
            HorizontalDivider(Modifier.weight(1f), color = Color(0xFFD8E0EA))
        }
        TextButton(onClick = onHowToConnect) { Text("How to connect?", color = Blue) }
        Spacer(Modifier.weight(1f))
        Text("Make sure DropBot is open on your laptop.", color = Muted, fontSize = 12.sp)
    }
}

@Composable
private fun ScannerScreen(onBack: () -> Unit, onPaired: (String) -> Unit, error: String = "") {
    val scanner = androidx.activity.compose.rememberLauncherForActivityResult(ScanContract()) { result ->
        if (result.contents != null) onPaired(result.contents)
    }
    LaunchedEffect(Unit) {
        scanner.launch(ScanOptions().apply {
            setPrompt("Scan the QR code shown on your laptop")
            setBeepEnabled(true)
            setOrientationLocked(false)
        })
    }
    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF26313B)).padding(22.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            TextButton(onClick = onBack) { Text("‹", color = Color.White, fontSize = 30.sp) }
            TextButton(onClick = { }) { Text("ϟ", color = Color.White, fontSize = 22.sp) }
        }
        Spacer(Modifier.height(45.dp))
        Text("Scan QR Code", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("The camera scanner opens automatically. Align the QR code from your laptop within the frame.", color = Color(0xFFD8E1E8), textAlign = TextAlign.Center)
        Spacer(Modifier.height(42.dp))
        Box(
            Modifier.size(245.dp).border(3.dp, Blue, RoundedCornerShape(18.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text("QR", color = Color.White.copy(alpha = 0.45f), fontSize = 48.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.weight(1f))
        Card(colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.94f)), shape = RoundedCornerShape(16.dp)) {
            Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                IconBubble("▣", size = 38.dp)
                Spacer(Modifier.width(10.dp))
                Text("When the code is recognized, DropBot will connect automatically.", color = Ink, fontSize = 12.sp)
            }
        }
        Spacer(Modifier.height(14.dp))
        if (error.isNotBlank()) {
            Text(error, color = Color(0xFFD14B57), fontSize = 12.sp, textAlign = TextAlign.Center)
            Spacer(Modifier.height(8.dp))
        }
        OutlinedButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("Cancel", color = Color.White) }
    }
}

@Composable
private fun SuccessScreen(phoneName: String, onContinue: () -> Unit) {
    OnboardingLayout {
        Spacer(Modifier.height(42.dp))
        Box(Modifier.size(112.dp).clip(CircleShape).background(SoftBlue), contentAlignment = Alignment.Center) {
            Text("✓", color = Blue, fontSize = 60.sp, fontWeight = FontWeight.Light)
        }
        Spacer(Modifier.height(22.dp))
        Text("Connected!", fontSize = 25.sp, fontWeight = FontWeight.Bold, color = Ink)
        Spacer(Modifier.height(8.dp))
        Text("Your phone has been successfully paired with DropBot.", color = Muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(28.dp))
        DeviceCard("Yash's Laptop", connected = true)
        Spacer(Modifier.weight(1f))
        PrimaryButton("Continue  →", onContinue)
    }
}

@Composable
private fun HomeScreen(phoneName: String, tab: HomeTab, onTabChange: (HomeTab) -> Unit, onSendFile: () -> Unit, onDisconnect: () -> Unit) {
    Scaffold(
        containerColor = Page,
        bottomBar = {
            HomeNavigation(tab, onTabChange)
        }
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 18.dp)
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("DropBot", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Ink)
                Text("⚙", color = Ink, fontSize = 22.sp)
            }
            Spacer(Modifier.height(18.dp))
            when (tab) {
                HomeTab.Home -> HomeDashboard(phoneName, onSendFile, onDisconnect)
                HomeTab.History -> HistoryContent()
                HomeTab.Devices -> DevicesContent(phoneName, onDisconnect)
                HomeTab.Settings -> SettingsContent(phoneName, onDisconnect)
            }
        }
    }
}

@Composable
private fun HomeDashboard(phoneName: String, onSendFile: () -> Unit, onDisconnect: () -> Unit) {
    DeviceCard("Yash's Laptop", connected = true)
    Spacer(Modifier.height(12.dp))
    PrimaryButton("↔  Send Files", onClick = onSendFile)
    Spacer(Modifier.height(22.dp))
    SectionTitle("Recent Transfers", "See All")
    EmptyHistory()
    Spacer(Modifier.height(18.dp))
    SectionTitle("Connection Status")
    StatusCard(phoneName)
}

@Composable
private fun HistoryContent() {
    SectionTitle("Transfer History")
    HistoryRow("Project_Final.zip", "842 MB  •  2 min ago", "ZIP")
    HistoryRow("IMG_20231006.jpg", "4.2 MB  •  15 min ago", "IMG")
    HistoryRow("Presentation.pptx", "12 MB  •  1 hour ago", "PPT")
}

@Composable
private fun DevicesContent(phoneName: String, onDisconnect: () -> Unit) {
    SectionTitle("Connected Devices")
    DeviceCard("Yash's Laptop", connected = true)
    Spacer(Modifier.height(10.dp))
    DeviceCard(phoneName, connected = true)
    Spacer(Modifier.height(18.dp))
    OutlinedButton(onClick = onDisconnect, modifier = Modifier.fillMaxWidth()) { Text("Disconnect laptop", color = Color(0xFFD14B57)) }
}

@Composable
private fun SettingsContent(phoneName: String, onDisconnect: () -> Unit) {
    SectionTitle("App Settings")
    DeviceCard("Connected devices", connected = true)
    Spacer(Modifier.height(8.dp))
    SettingRow("Phone name", phoneName)
    SettingRow("Auto-accept transfers", "On")
    SettingRow("Maximum file size", "2 GB")
    SettingRow("About DropBot", "Version 1.0")
    Spacer(Modifier.height(20.dp))
    OutlinedButton(onClick = onDisconnect, modifier = Modifier.fillMaxWidth()) { Text("Pair a different laptop", color = Blue) }
}

@Composable
private fun OnboardingLayout(content: @Composable ColumnScope.() -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(horizontal = 28.dp, vertical = 34.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        content = content
    )
}

@Composable
private fun PrimaryButton(text: String, onClick: () -> Unit, enabled: Boolean = true) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.fillMaxWidth().height(50.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Blue, disabledContainerColor = Color(0xFFBFDCF5))
    ) { Text(text, fontWeight = FontWeight.SemiBold) }
}

@Composable
private fun BotMark(modifier: Modifier = Modifier) {
    Box(modifier.clip(CircleShape).background(SoftBlue), contentAlignment = Alignment.Center) {
        Text("🤖", fontSize = 52.sp)
    }
}

@Composable
private fun IconBubble(text: String, size: Dp = 62.dp) {
    Box(Modifier.size(size).clip(CircleShape).background(SoftBlue), contentAlignment = Alignment.Center) {
        Text(text, color = Blue, fontSize = (size.value / 2.4f).sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun StepDots(selected: Int, total: Int) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        repeat(total) { index ->
            Box(Modifier.size(if (index == selected) 7.dp else 6.dp).clip(CircleShape).background(if (index == selected) Blue else Color(0xFFC8D3DE)))
        }
    }
}

@Composable
private fun FeatureCard(icon: String, title: String, body: String) {
    Card(
        Modifier.fillMaxWidth().padding(vertical = 5.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
            IconBubble(icon, 42.dp)
            Spacer(Modifier.width(13.dp))
            Column {
                Text(title, color = Ink, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(body, color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
            }
        }
    }
}

@Composable
private fun DeviceCard(name: String, connected: Boolean) {
    Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(15.dp)) {
        Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
            IconBubble("▱", 42.dp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(name, color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text(if (connected) "●  Connected" else "○  Not connected", color = if (connected) Green else Muted, fontSize = 11.sp)
            }
            Text("›", color = Muted, fontSize = 24.sp)
        }
    }
}

@Composable
private fun SectionTitle(title: String, action: String? = null) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(title, color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        if (action != null) TextButton(onClick = { }) { Text(action, color = Blue, fontSize = 12.sp) }
    }
    Spacer(Modifier.height(9.dp))
}

@Composable
private fun EmptyHistory() {
    Card(Modifier.fillMaxWidth().height(112.dp), colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(15.dp)) {
        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Text("□", color = Color(0xFFB7C3D0), fontSize = 28.sp)
            Text("No transfers yet", color = Muted, fontSize = 12.sp)
        }
    }
}

@Composable
private fun HistoryRow(name: String, details: String, type: String) {
    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp), colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(13.dp)) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            IconBubble(type, 38.dp)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(name, color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text(details, color = Muted, fontSize = 11.sp)
            }
            Text("✓", color = Green, fontSize = 20.sp)
        }
    }
}

@Composable
private fun StatusCard(phoneName: String) {
    Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = SoftBlue), shape = RoundedCornerShape(15.dp)) {
        Column(Modifier.padding(15.dp)) {
            Text("Ready to transfer", color = Ink, fontWeight = FontWeight.Bold)
            Text("Connected to $phoneName", color = Muted, fontSize = 12.sp)
        }
    }
}

@Composable
private fun SettingRow(label: String, value: String) {
    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp), colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(13.dp)) {
        Row(Modifier.fillMaxWidth().padding(15.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, color = Ink, fontSize = 13.sp)
            Text(value, color = Muted, fontSize = 12.sp)
        }
    }
}

@Composable
private fun HomeNavigation(selected: HomeTab, onSelected: (HomeTab) -> Unit) {
    Surface(color = Color.White, shadowElevation = 4.dp) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
        listOf(HomeTab.Home, HomeTab.History, HomeTab.Settings).forEach { item ->
                TextButton(onClick = { onSelected(item) }) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            if (item == HomeTab.Home) "⌂"
                            else if (item == HomeTab.History) "◷"
                            else if (item == HomeTab.Devices) "♧"
                            else "⚙",
                            color = if (selected == item) Blue else Muted,
                            fontSize = 20.sp
                        )
                        Text(item.name, color = if (selected == item) Blue else Muted, fontSize = 10.sp)
                    }
                }
            }
        }
    }
}

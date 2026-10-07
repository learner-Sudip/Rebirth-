package com.mentis.sovereign

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import androidx.core.app.NotificationCompat

class FocusForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "mentis_focus_timer_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START = "com.mentis.ACTION_START"
        const val ACTION_STOP = "com.mentis.ACTION_STOP"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_DURATION_MINUTES = "extra_duration_minutes"
    }

    private var countDownTimer: CountDownTimer? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val title = intent.getStringExtra(EXTRA_TITLE) ?: "Deep Focus Flow"
                val durationMins = intent.getIntExtra(EXTRA_DURATION_MINUTES, 25)
                startFocusSession(title, durationMins)
            }
            ACTION_STOP -> {
                stopFocusSession()
            }
        }
        return START_NOT_STICKY
    }

    private fun startFocusSession(title: String, durationMins: Int) {
        val totalMillis = durationMins * 60 * 1000L

        startForeground(NOTIFICATION_ID, buildNotification(title, "Focusing · ${durationMins}m remaining"))

        countDownTimer?.cancel()
        countDownTimer = object : CountDownTimer(totalMillis, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val mins = (millisUntilFinished / 1000) / 60
                val secs = (millisUntilFinished / 1000) % 60
                val timeFormatted = String.format("%02d:%02d", mins, secs)
                updateNotification(title, "Focusing · $timeFormatted remaining · Distractions Shielded")
            }

            override fun onFinish() {
                updateNotification(title, "Focus block completed! Tap to review.")
                stopSelf()
            }
        }.start()
    }

    private fun stopFocusSession() {
        countDownTimer?.cancel()
        countDownTimer = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildNotification(title: String, text: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Mentis: $title")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
    }

    private fun updateNotification(title: String, text: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, buildNotification(title, text))
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Mentis Active Focus Timer",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows live remaining time during active cognitive focus sessions"
                setShowBadge(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        countDownTimer?.cancel()
        super.onDestroy()
    }
}

package com.mentis.sovereign

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class FocusAccessibilityService : AccessibilityService() {

    // Target packages to monitor during active shield sessions
    private val blockedPackages = setOf(
        "com.instagram.android",
        "com.zhiliaoapp.musically",
        "com.google.android.youtube",
        "com.reddit.frontpage",
        "com.twitter.android",
        "com.facebook.katana"
    )

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString() ?: return

            // If a blocked distraction app is launched
            if (blockedPackages.contains(packageName)) {
                // Launch Mentis friction intercept barrier
                val launchIntent = Intent(this, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                    putExtra("EXTRA_INTERCEPT_APP", packageName)
                }
                startActivity(launchIntent)
            }
        }
    }

    override fun onInterrupt() {
        // Accessibility service interrupted
    }
}

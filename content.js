function removeEverything() {
    const selectors = [
        'video',
        '[href*="reel"]',
        '[href*="reels"]',
        '[aria-label="Reels"]',
        '[aria-label="Stories"]',
        '[role="feed"] div[style*="video"]',
        'div[data-pagelet*="Video"]',
        'div[data-pagelet*="Reels"]',
        'div[data-pagelet*="Stories"]',
        '[data-visualcompletion="ignore-dynamic"] video',
        '[data-sscoverage="video"]',
        'div[aria-label="Watch"]',
        '[href*="watch"]',
        '[data-pagelet*="HomeStories"]'
    ];

    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
    });
}

// First run
removeEverything();

// Run repeatedly (Facebook loads content dynamically)
const observer = new MutationObserver(() => {
    removeEverything();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

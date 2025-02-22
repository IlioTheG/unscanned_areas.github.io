// Track how many models are loading
let loadingCount = 0;

/**
 * Show the loading screen.
 */
export function showLoadingScreen() {
    if (loadingCount === 0) {
        document.getElementById("loading-screen").style.display = "flex";
    }
    loadingCount++;
}

/**
 * Hide the loading screen when all models are loaded.
 */
export function hideLoadingScreen() {
    loadingCount--;
    if (loadingCount <= 0) {
        document.getElementById("loading-screen").style.display = "none";
    }
}

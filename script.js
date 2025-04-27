// Fungsi untuk mengarahkan ke WhatsApp sesuai game yang dipilih
function redirectToWA(game) {
    const message = `Halo, saya ingin membeli produk untuk game ${game}.`;
    const waUrl = `https://wa.me/6285648211278?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
}

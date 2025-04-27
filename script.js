// Fungsi untuk mengarahkan ke WhatsApp sesuai game yang dipilih
function redirectToWA(gameName) {
    const phoneNumber = "6285648211278";  // Ganti dengan nomor WhatsApp yang sesuai
    const message = Halo, saya ingin melakukan top-up untuk game ${gameName}. Mohon bantuannya.;

    const encodedMessage = encodeURIComponent(message);
    const url = https://wa.me/${phoneNumber}?text=${encodedMessage};

    window.open(url, '_blank');  // Membuka WhatsApp di tab baru
}

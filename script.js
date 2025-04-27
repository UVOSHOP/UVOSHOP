// Ambil semua tombol 'Buy Now'
const buyButtons = document.querySelectorAll('.buy-now');

buyButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const product = event.target.getAttribute('data-product');
        const selectElement = event.target.previousElementSibling; // Element select
        const diamondAmount = selectElement.value;
        const price = selectElement.selectedOptions[0].text.split(' - ')[1]; // Ambil harga dari text option

        // Format pesan WhatsApp
        const phoneNumber = '+6285648211278'; // Nomor WhatsApp
        const message = `epep%0A${diamondAmount}dm%0A${price}`;

        // Arahkan ke WhatsApp dengan pesan otomatis
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    });
});

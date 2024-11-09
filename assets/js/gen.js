// Fungsi untuk mengambil data generasi dan menampilkan kartu
async function fetchGenerations() {
    const generationCards = document.getElementById('generation-cards');

    for (let gen = 1; gen <= 9; gen++) {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${gen}/`);
        const data = await response.json();

        // Buat elemen kartu generasi
        const generationCard = document.createElement('div');
        generationCard.classList.add('generation-card');
        generationCard.innerHTML = `
            <h2>${data.name.replace(/generation-/i, 'Generation ').toUpperCase()}</h2>
            <p>${data.main_region.name.charAt(0).toUpperCase() + data.main_region.name.slice(1)} Region</p>
        `;

        // Tambahkan event listener untuk menampilkan detail Pokémon saat diklik
        generationCard.addEventListener('click', () => showGenerationDetails(data));

        // Tambahkan kartu ke kontainer
        generationCards.appendChild(generationCard);
    }
}

// Fungsi untuk menampilkan detail generasi dalam modal dengan dua kolom
function showGenerationDetails(generationData) {
    const pokemonListLeft = document.getElementById('pokemonListLeft');
    const pokemonListRight = document.getElementById('pokemonListRight');
    
    // Kosongkan daftar Pokémon di kedua kolom
    pokemonListLeft.innerHTML = '';
    pokemonListRight.innerHTML = '';

    // Set judul modal dengan nama generasi
    document.getElementById('modalGenerationTitle').textContent = generationData.name.replace(/generation-/i, 'Generation ').toUpperCase();

    // Tampilkan setiap Pokémon dalam generasi ini, secara berselang-seling di kolom kiri dan kanan
    generationData.pokemon_species.forEach((pokemon, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = capitalizeFirstLetter(pokemon.name.replace(/-/g, ' '));

        // Tambahkan secara bergantian ke kolom kiri dan kanan
        if (index % 2 === 0) {
            pokemonListLeft.appendChild(listItem);
        } else {
            pokemonListRight.appendChild(listItem);
        }
    });

    // Tampilkan modal
    document.getElementById('pokemonModal').style.display = 'flex';
}

// Menutup modal ketika tombol close diklik
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("pokemonModal").style.display = "none";
});

// Fungsi bantu untuk kapitalisasi huruf pertama
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Panggil fungsi untuk mengambil data generasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', fetchGenerations);

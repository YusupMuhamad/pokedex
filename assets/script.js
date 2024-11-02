let pokemonDetails; // Variabel global untuk menyimpan detail Pokémon
let filteredMoves = []; // Array untuk menyimpan gerakan yang sudah difilter
let currentMoveIndex = 0; // Variabel untuk menyimpan indeks gerakan saat ini
const movesPerPage = 5; // Jumlah gerakan yang ditampilkan per halaman
let currentSearchToken = null; // Menyimpan token pencarian saat ini
const suggestionsList = document.getElementById('suggestions');

let isLoading = false; // Variabel untuk mengatur status loading

let offset = 0;
const limit = 8;
const pokemonContainer = document.getElementById('pokemon-list');
const searchInput = document.getElementById('search-input');
const loadMoreButton = document.getElementById('load-more-button');

const pokemonModal = document.getElementById('pokemon-modal');
const modalPokemonName = document.getElementById('modal-pokemon-name');
const modalPokemonImage = document.getElementById('modal-pokemon-image');
const modalPokemonId = document.getElementById('modal-pokemon-id');
const modalPokemonTypes = document.getElementById('modal-pokemon-types');
const modalPokemonStats = document.getElementById('modal-pokemon-stats');
const modalPokemonMoves = document.getElementById('modal-pokemon-moves');
const modalPokemonEvolutions = document.getElementById('modal-pokemon-evolutions');
const closeButton = document.querySelector('.close-button');
const modalPokemonWeakness = document.getElementById('modal-pokemon-weakness');
const modalPokemonDescription = document.getElementById('modal-pokemon-description');


// URL untuk daftar Pokémon berdasarkan offset dan limit
const apiUrl = (offset, limit) => `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function cleanDescription(description) {
    return description.replace(/[\x00-\x1F\x7F-\x9F]+/g, ' ').trim();
}



// Fungsi menampilkan daftar Pokémon
async function fetchPokemon() {
    try {
        const response = await fetch(apiUrl(offset, limit));
        const data = await response.json();
        const pokemonList = data.results;

        // Tampilkan Pokémon yang baru ditambahkan
        for (const pokemon of pokemonList) {
            const pokemonData = await fetch(pokemon.url);
            const pokemonDetails = await pokemonData.json();

            const pokemonItem = document.createElement('div');
            pokemonItem.classList.add('pokemon-item');

            // Tambahkan elemen ID Pokémon dari API
            const pokemonId = document.createElement('p');
            pokemonId.classList.add('pokemon-id');
            pokemonId.textContent = `#${pokemonDetails.id}`;

            const pokemonImage = document.createElement('img');
            pokemonImage.src = pokemonDetails.sprites.front_default;
            pokemonImage.alt = pokemon.name;

            const pokemonName = document.createElement('p');
            // Mengubah huruf awal nama Pokémon menjadi kapital
            pokemonName.textContent = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);

            // Buat elemen untuk setiap tipe Pokémon
            const typesContainer = document.createElement('div');
            pokemonDetails.types.forEach(typeInfo => {
                const typeSpan = document.createElement('span');
                typeSpan.classList.add('pokemon-type', typeInfo.type.name);
                // Mengubah huruf awal tipe Pokémon menjadi kapital
                typeSpan.textContent = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
                typesContainer.appendChild(typeSpan);
            });

            // Tambahkan ID, gambar, nama, dan tipe ke item Pokémon
            pokemonItem.appendChild(pokemonId);
            pokemonItem.appendChild(pokemonImage);
            pokemonItem.appendChild(pokemonName);
            pokemonItem.appendChild(typesContainer);
            pokemonContainer.appendChild(pokemonItem);

            // Tambahkan event listener untuk mengklik Pokémon
            pokemonItem.addEventListener('click', () => {
                showPokemonDetails(pokemonDetails.id); // Tampilkan detail ketika Pokémon diklik
            });

            pokemonContainer.appendChild(pokemonItem);
        }
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
    }
}


// Fungsi pencarian Pokémon berdasarkan nama atau ID
async function searchPokemon(query) {
    // Buat token pencarian baru
    const searchToken = Symbol();
    currentSearchToken = searchToken;

    try {
        const searchQuery = query.startsWith('#') ? query.slice(1) : query;

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery}`);
        
        // Jika token pencarian sudah berubah, abaikan respons ini
        if (currentSearchToken !== searchToken) return;

        if (!response.ok) throw new Error("Pokémon not found");

        const pokemonDetails = await response.json();
        pokemonContainer.innerHTML = ''; // Bersihkan tampilan sebelumnya

        // Tampilkan detail Pokémon yang ditemukan
        const pokemonItem = document.createElement('div');
        pokemonItem.classList.add('pokemon-item');

        pokemonItem.addEventListener('click', () => {
            showPokemonDetails(pokemonDetails.id); 
        });

        const pokemonId = document.createElement('p');
        pokemonId.classList.add('pokemon-id');
        pokemonId.textContent = `#${pokemonDetails.id}`;

        const pokemonImage = document.createElement('img');
        pokemonImage.src = pokemonDetails.sprites.front_default;
        pokemonImage.alt = pokemonDetails.name;

        const pokemonNameElem = document.createElement('p');
        pokemonNameElem.textContent = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);

        const typesContainer = document.createElement('div');
        pokemonDetails.types.forEach(typeInfo => {
            const typeSpan = document.createElement('span');
            typeSpan.classList.add('pokemon-type', typeInfo.type.name);
            typeSpan.textContent = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
            typesContainer.appendChild(typeSpan);
        });

        pokemonItem.appendChild(pokemonId);
        pokemonItem.appendChild(pokemonImage);
        pokemonItem.appendChild(pokemonNameElem);
        pokemonItem.appendChild(typesContainer);
        pokemonContainer.appendChild(pokemonItem);

    } catch (error) {
        // Jika token pencarian sudah berubah, abaikan pesan error ini
        if (currentSearchToken !== searchToken) return;
        
        console.error("Error fetching Pokémon data:", error);
        pokemonContainer.innerHTML = '<p class="no-pokemon">Pokémon not found. Please try again.</p>';
    }
}



// Fungsi untuk menampilkan modal dengan detail Pokémon
async function showPokemonDetails(pokemonId) {
    // Cegah pemanggilan fungsi jika sudah dalam proses loading
    if (isLoading) return;
    isLoading = true; // Set status loading

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        pokemonDetails = await response.json(); // Simpan detail Pokémon ke variabel global

        // Kosongkan konten modal sebelumnya
        modalPokemonName.textContent = '';
        modalPokemonImage.src = '';
        modalPokemonId.textContent = '';
        modalPokemonTypes.innerHTML = '';
        modalPokemonWeakness.innerHTML = '';
        modalPokemonStats.innerHTML = '';
        modalPokemonMoves.innerHTML = ''; // Bersihkan moves sebelumnya
        modalPokemonEvolutions.innerHTML = ''; // Bersihkan evolusi sebelumnya
        modalPokemonDescription.textContent = ''; // Bersihkan deskripsi sebelumnya

        modalPokemonName.textContent = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
        modalPokemonImage.src = pokemonDetails.sprites.front_default;
        modalPokemonId.textContent = `#${pokemonDetails.id}`;

        // Tampilkan tipe
        const types = pokemonDetails.types.map(typeInfo => {
            const typeName = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
            modalPokemonTypes.innerHTML += `<span class="pokemon-type ${typeInfo.type.name}">${typeName}</span>`;
            return typeInfo.type.name;
        });

        // Dapatkan kelemahan
        const weaknesses = await getWeaknesses(types);

        // Tampilkan kelemahan
        weaknesses.forEach(weakness => {
            const weaknessElement = document.createElement('div');
            weaknessElement.classList.add('weakness', weakness.toLowerCase()); // Tambahkan kelas berdasarkan tipe
            weaknessElement.textContent = weakness.charAt(0).toUpperCase() + weakness.slice(1); // Ubah huruf awal menjadi kapital
            modalPokemonWeakness.appendChild(weaknessElement);
        });

        // Tampilkan statistik
        pokemonDetails.stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.classList.add('stat-item');

            const statName = document.createElement('span');
            statName.textContent = `${stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1)}: `;
            statName.classList.add('stat-name');

            const statValue = document.createElement('span');
            statValue.textContent = stat.base_stat;
            statValue.classList.add('stat-value');

            statItem.appendChild(statName);
            statItem.appendChild(statValue);
            modalPokemonStats.appendChild(statItem);
        });

        // Ambil deskripsi Pokémon
        const speciesResponse = await fetch(pokemonDetails.species.url);
        const speciesDetails = await speciesResponse.json();
        const flavorTextEntries = speciesDetails.flavor_text_entries;
        const englishDescription = flavorTextEntries.find(entry => entry.language.name === 'en').flavor_text;

        // Tampilkan deskripsi Pokémon
        modalPokemonDescription.textContent = cleanDescription(englishDescription);

        // Tampilkan moves
        currentMoveIndex = 0; // Reset indeks saat menampilkan gerakan
        filteredMoves = pokemonDetails.moves; // Simpan semua gerakan ke array filteredMoves
        displayMoves(filteredMoves); // Panggil fungsi untuk menampilkan gerakan

        // Ambil evolusi Pokémon
        const evolutionChainResponse = await fetch(speciesDetails.evolution_chain.url);
        const evolutionChainDetails = await evolutionChainResponse.json();
        
        const evolutions = evolutionChainDetails.chain;
        displayEvolutions(evolutions);

        // Tampilkan modal
        pokemonModal.style.display = 'block';
    } catch (error) {
        console.error("Error fetching Pokémon details:", error);
    } finally {
        isLoading = false; // Reset status loading di akhir proses
    }
}



// Fungsi untuk mendapatkan kelemahan berdasarkan tipe
async function getWeaknesses(types) {
    const weaknesses = new Set();

    for (const type of types) {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const typeDetails = await response.json();

        // Ambil kelemahan
        typeDetails.damage_relations.double_damage_from.forEach(weakType => {
            weaknesses.add(weakType.name.charAt(0).toUpperCase() + weakType.name.slice(1)); // Ubah huruf awal menjadi kapital
        });
    }

    return Array.from(weaknesses);
}


// Fungsi untuk menampilkan evolusi Pokémon
async function displayEvolutions(chain) {
    // Ambil gambar untuk evolusi
    const evolutionResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${chain.species.name}`);
    const evolutionDetails = await evolutionResponse.json();

    // Tambahkan gambar evolusi
    const evolutionImage = document.createElement('img');
    evolutionImage.src = evolutionDetails.sprites.front_default;
    evolutionImage.alt = evolutionDetails.name;
    evolutionImage.style.width = '100px'; // Ukuran gambar
    evolutionImage.style.height = '100px'; // Ukuran gambar

    // Tambahkan nama evolusi
    const evolutionName = document.createElement('p');
    evolutionName.textContent = chain.species.name.charAt(0).toUpperCase() + chain.species.name.slice(1);
    evolutionName.classList.add('evolution-name'); // Tambahkan kelas CSS untuk styling
    evolutionName.style.textAlign = 'center'; // Pusatkan teks

    // Tambahkan metode evolusi ke elemen terpisah
    const methodElement = document.createElement('p');
    methodElement.style.textAlign = 'center'; // Pusatkan teks metode evolusi

    // Jika evolusi memiliki detail
    if (chain.evolution_details && chain.evolution_details.length > 0) {
        chain.evolution_details.forEach(detail => {
            let methodText = '';
            if (detail.min_level) {
                methodText += `Level: ${detail.min_level}`;
            }
            if (detail.trigger.name === 'trade') {
                methodText += ' With trading';
            }
            if (detail.item) {
                methodText += ` Item: ${detail.item.name.charAt(0).toUpperCase() + detail.item.name.slice(1)}`;
            }
            if (detail.known_move) {
                methodText += ` Move: ${detail.known_move.name}`;
            }
            // Set text content untuk metode evolusi
            methodElement.textContent = methodText;
        });
    }

    // Tambahkan gambar dan nama ke evolusi dalam satu container
    const evolutionContainer = document.createElement('div');
    evolutionContainer.style.display = 'flex'; // Gunakan flexbox untuk menata konten
    evolutionContainer.style.flexDirection = 'column'; // Susun secara vertikal
    evolutionContainer.style.alignItems = 'center'; // Pusatkan konten secara horizontal
    evolutionContainer.style.marginRight = '10px'; // Tambahkan margin untuk jarak antar evolusi

    // Tambahkan elemen gambar dan nama ke container
    evolutionContainer.appendChild(evolutionImage);
    evolutionContainer.appendChild(evolutionName);
    evolutionContainer.appendChild(methodElement); // Tambahkan metode evolusi di sini

    // Tambahkan evolusi container ke modal
    modalPokemonEvolutions.appendChild(evolutionContainer);

    // Jika ada evolusi lebih lanjut
    if (chain.evolves_to.length > 0) {
        chain.evolves_to.forEach(evolution => {
            displayEvolutions(evolution); // Panggil fungsi rekursif untuk evolusi selanjutnya
        });
    }
}

function displayMoves(moves) {
    const modalPokemonMoves = document.getElementById('modal-pokemon-moves');
    modalPokemonMoves.innerHTML = ''; // Bersihkan konten sebelumnya

    if (moves.length === 0) {
        modalPokemonMoves.innerHTML = '<div>No moves found</div>'; // Pesan jika tidak ada gerakan
        return; // Keluar dari fungsi jika tidak ada gerakan
    }

    // Tampilkan hanya gerakan yang ada dalam rentang currentMoveIndex
    for (let i = currentMoveIndex; i < currentMoveIndex + movesPerPage; i++) {
        const move = moves[i];
        if (move) {
            (async () => {
                const moveResponse = await fetch(move.move.url);
                const moveDetails = await moveResponse.json();

                const moveItem = document.createElement('div');
                moveItem.classList.add('move-item');

                const moveText = document.createElement('span');
                moveText.textContent = move.move.name.charAt(0).toUpperCase() + move.move.name.slice(1);
                
                const moveType = document.createElement('span');
                moveType.textContent = moveDetails.type.name.charAt(0).toUpperCase() + moveDetails.type.name.slice(1);
                moveType.classList.add('move-type', moveDetails.type.name);

                moveItem.appendChild(moveText);
                moveItem.appendChild(moveType);
                modalPokemonMoves.appendChild(moveItem);
            })();
        }
    }

    // Tombol untuk Previous dan Next
    updateNavigationButtons();
}

// Fungsi untuk menampilkan saran Pokémon berdasarkan input
async function fetchPokemonSuggestions(query) {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const data = await response.json();

    const suggestions = data.results
        .filter(pokemon => pokemon.name.startsWith(query))
        .map(pokemon => pokemon.name);

    displaySuggestions(suggestions);
}

// Fungsi untuk menampilkan saran di elemen suggestionsList
function displaySuggestions(suggestions) {
    suggestionsList.innerHTML = '';
    if (suggestions.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.classList.add('suggestion-item');
        item.textContent = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
        
        // Tambahkan event listener untuk klik pada item saran
        item.addEventListener('click', () => {
            searchInput.value = suggestion;
            suggestionsList.style.display = 'none';
            searchPokemon(suggestion);
        });

        suggestionsList.appendChild(item);
    });
    suggestionsList.style.display = 'block';
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-moves-button');
    const nextButton = document.getElementById('next-moves-button');

    // Enable or disable buttons based on currentMoveIndex
    prevButton.disabled = currentMoveIndex === 0;
    nextButton.disabled = currentMoveIndex + movesPerPage >= filteredMoves.length; // Ganti dengan filteredMoves
}

// Event listener untuk pencarian dengan debounce
document.getElementById('move-search').addEventListener('input', debounce((event) => {
    const searchTerm = event.target.value.toLowerCase();

    // Jika input pencarian kosong, reset filteredMoves ke semua gerakan
    if (searchTerm === '') {
        filteredMoves = pokemonDetails.moves; // Mengatur kembali ke semua gerakan
        currentMoveIndex = 0; // Reset indeks
    } else {
        // Filter moves berdasarkan input pencarian
        filteredMoves = pokemonDetails.moves.filter(move => 
            move.move.name.toLowerCase().includes(searchTerm)
        );
        currentMoveIndex = 0; // Reset index
    }

    displayMoves(filteredMoves); // Tampilkan gerakan yang difilter
    updateNavigationButtons(); // Update tombol navigasi
}, 300)); // 300ms delay


document.getElementById('prev-moves-button').addEventListener('click', () => {
    if (currentMoveIndex > 0) {
        currentMoveIndex -= movesPerPage;
        displayMoves(filteredMoves); // Ganti dengan filteredMoves
    }
});

document.getElementById('next-moves-button').addEventListener('click', () => {
    if (currentMoveIndex + movesPerPage < filteredMoves.length) { // Ganti dengan filteredMoves
        currentMoveIndex += movesPerPage;
        displayMoves(filteredMoves); // Ganti dengan filteredMoves
    }
});

// Event listener untuk menutup modal
closeButton.addEventListener('click', () => {
    pokemonModal.style.display = 'none';
});

// Event listener untuk input pencarian
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query) {
        loadMoreButton.style.display = 'none';
        pokemonContainer.innerHTML = ''; 
        fetchPokemonSuggestions(query); // Panggil untuk saran
        
        // Reset hasil pencarian saat mengetik kembali
        searchPokemon(query);
    } else {
        suggestionsList.style.display = 'none'; 
        loadMoreButton.style.display = 'block';
        offset = 0;
        pokemonContainer.innerHTML = ''; 
        fetchPokemon();
    }
});

// Sembunyikan daftar saran saat klik di luar input
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.style.display = 'none';
    }
});

// Event listener untuk tombol "Lihat Pokémon Lainnya"
loadMoreButton.addEventListener('click', () => {
    offset += limit; // Tambah offset untuk memuat lebih banyak Pokémon
    fetchPokemon();
});

// Panggilan awal untuk menampilkan daftar pertama
fetchPokemon();
// Event yang dipicu ketika halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    let offset = 0;
    let searchMode = false; // Mode pencarian
    fetchItems(offset); // Ambil item default saat pertama kali dimuat

    document.getElementById("categorySelect").addEventListener("change", handleCategoryChange);
    document.getElementById("moreItemsButton").addEventListener("click", () => {
        offset += 20;
        fetchItems(offset);
    });

    // Event untuk pencarian item
    document.getElementById("searchInput").addEventListener("input", handleSearch);
});

// Fungsi debounce untuk menunda eksekusi fungsi pencarian
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function handleCategoryChange(event) {
    const category = event.target.value;
    const itemContainer = document.getElementById('item-container');
    itemContainer.innerHTML = ""; // Kosongkan kontainer item

    // Sembunyikan tombol "More Items" jika kategori dipilih
    document.getElementById("moreItemsButton").style.display = category === "default" ? "block" : "none";

    if (category === "default") {
        offset = 0; // Reset offset
        fetchItems(offset); // Tampilkan 20 item secara default
    } else {
        fetchItemsByCategory(category); // Ambil semua item berdasarkan kategori
    }
}

// Fungsi untuk mengambil item default dalam jumlah 20 dan menampilkan secara berurutan
async function fetchItems(offset = 0) {
    const itemContainer = document.getElementById('item-container');
    const response = await fetch(`https://pokeapi.co/api/v2/item?offset=${offset}&limit=20`);
    const data = await response.json();
    
    data.results.forEach(async (item) => {
        const itemDetailResponse = await fetch(item.url);
        const itemDetail = await itemDetailResponse.json();
        createItemCard(itemDetail); // Panggil fungsi untuk membuat kartu dengan detail lengkap
    });

    if (data.results.length < 20 || searchMode) {
        document.getElementById("moreItemsButton").style.display = "none";
    } else {
        document.getElementById("moreItemsButton").style.display = "block";
    }
}
async function fetchItemsByCategory(category) {
    const categoryUrlMap = {
        "pokeballs": "https://pokeapi.co/api/v2/item-category/34", // URL kategori Poké Balls
        "berries": "https://pokeapi.co/api/v2/item-category/7",    // URL kategori Berries
        // Tambahkan kategori lainnya dengan ID sesuai
    };

    const response = await fetch(categoryUrlMap[category]);
    const data = await response.json();

    data.items.forEach(async (item) => {
        const itemDetailResponse = await fetch(item.url);
        const itemDetail = await itemDetailResponse.json();
        createItemCard(itemDetail); // Panggil fungsi untuk membuat kartu dengan detail lengkap
    });
}

// Modifikasi handleSearch dengan debounce
async function handleSearch(event) {
    const query = event.target.value.trim();
    const itemContainer = document.getElementById('item-container');

    if (query) {
        searchMode = true;
        itemContainer.innerHTML = ""; // Kosongkan container item sebelum menampilkan hasil pencarian
        fetchSearchedItems(query); // Ambil item yang sesuai dengan pencarian
    } else {
        searchMode = false;
        itemContainer.innerHTML = ""; // Kosongkan container untuk memastikan tampilan benar-benar reset
        offset = 0; // Reset offset ke 0
        fetchItems(offset); // Tampilkan item default
    }
}

// Terapkan debounce pada handleSearch dengan delay 300 ms
document.getElementById("searchInput").addEventListener("input", debounce(handleSearch, 500));

// Fungsi untuk mengambil 1000 item ketika mencari, tetapi hanya menampilkan 20 pertama
async function fetchSearchedItems(query) {
    const itemContainer = document.getElementById('item-container');
    const response = await fetch(`https://pokeapi.co/api/v2/item?offset=0&limit=1000`);
    const data = await response.json();

    const filteredItems = data.results.filter(item => item.name.includes(query.toLowerCase()));
    const limitedItems = filteredItems.slice(0, 20); // Ambil hanya 20 pertama untuk ditampilkan

    limitedItems.forEach(async (item) => {
        const itemDetailResponse = await fetch(item.url);
        const itemDetail = await itemDetailResponse.json();
        createItemCard(itemDetail); // Buat kartu item
    });

    document.getElementById("moreItemsButton").style.display = "none"; // Sembunyikan tombol "More Items" dalam mode pencarian
}

// Fungsi untuk membuat kartu item
function createItemCard(itemDetail) {
    const itemContainer = document.getElementById('item-container');

    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.addEventListener("click", () => showModal(itemDetail));

    const itemId = document.createElement('p');
    itemId.classList.add('item-id');
    itemId.textContent = `#${itemDetail.id}`;

    const itemImage = document.createElement('img');
    itemImage.src = itemDetail.sprites.default;
    itemImage.alt = itemDetail.name;
    itemImage.classList.add('item-image');

    const itemName = document.createElement('p');
    itemName.classList.add('item-name');
    itemName.textContent = itemDetail.name.charAt(0).toUpperCase() + itemDetail.name.slice(1);

    itemCard.appendChild(itemId);
    itemCard.appendChild(itemImage);
    itemCard.appendChild(itemName);
    itemContainer.appendChild(itemCard);
}

// Fungsi untuk menampilkan modal dengan detail item
function showModal(itemDetail) {
    document.getElementById("itemModal").style.display = "flex";
    document.getElementById("modalItemId").textContent = `# ${itemDetail.id}`;
    document.getElementById("modalItemImage").src = itemDetail.sprites.default;
    document.getElementById("modalItemName").textContent = itemDetail.name.charAt(0).toUpperCase() + itemDetail.name.slice(1);
    document.getElementById("modalItemDescription").textContent = itemDetail.effect_entries[0]?.effect || "No description available.";
}


// Menutup modal ketika tombol close diklik
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("itemModal").style.display = "none";
});

// Menutup modal ketika area di luar modal diklik
window.addEventListener("click", (event) => {
    const modal = document.getElementById("itemModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Menampilkan atau menyembunyikan tombol panah ke atas saat menggulir
window.addEventListener("scroll", () => {
    const backToTopButton = document.getElementById("backToTopButton");
    if (window.scrollY > 300) { // Tampilkan tombol jika scroll lebih dari 300px
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
});

// Fungsi untuk menggulir ke atas saat tombol diklik
document.getElementById("backToTopButton").addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

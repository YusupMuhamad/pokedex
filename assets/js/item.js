document.addEventListener("DOMContentLoaded", () => {
    let offset = 0;
    fetchItems(offset); // Default fetch
    document.getElementById("categorySelect").addEventListener("change", handleCategoryChange);
    document.getElementById("moreItemsButton").addEventListener("click", () => {
        offset += 20;
        fetchItems(offset);
    });
});

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

async function fetchItems(offset = 0) {
    const itemContainer = document.getElementById('item-container');
    const response = await fetch(`https://pokeapi.co/api/v2/item?offset=${offset}&limit=20`);
    const data = await response.json();
    
    data.results.forEach(async (item) => {
        const itemDetailResponse = await fetch(item.url);
        const itemDetail = await itemDetailResponse.json();
        createItemCard(itemDetail); // Panggil fungsi untuk membuat kartu dengan detail lengkap
    });

    // Jika kurang dari 20 item, sembunyikan tombol "More Items"
    if (data.results.length < 20) {
        document.getElementById("moreItemsButton").style.display = "none";
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

function createItemCard(itemDetail) {
    const itemContainer = document.getElementById('item-container');

    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.addEventListener("click", () => showModal(itemDetail)); // Memastikan itemDetail lengkap

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

document.addEventListener("DOMContentLoaded", fetchItems);

async function fetchItems() {
    const itemContainer = document.getElementById('item-container');
    const response = await fetch('https://pokeapi.co/api/v2/item?limit=20'); // Batasi 20 item sebagai contoh
    const data = await response.json();

    data.results.forEach(async (item) => {
        const itemDetailResponse = await fetch(item.url);
        const itemDetail = await itemDetailResponse.json();

        const itemCard = document.createElement('div');
        itemCard.classList.add('item-card');

        const itemId = document.createElement('p');
        itemId.classList.add('item-id');
        itemId.textContent = `#${itemDetail.id}`; // Menampilkan ID item

        const itemImage = document.createElement('img');
        itemImage.src = itemDetail.sprites.default;
        itemImage.alt = item.name;
        itemImage.classList.add('item-image');

        const itemName = document.createElement('p');
        itemName.classList.add('item-name');
        itemName.textContent = item.name.charAt(0).toUpperCase() + item.name.slice(1);

        
        itemCard.appendChild(itemId); // Menambahkan ID ke item card
        itemCard.appendChild(itemImage);
        itemCard.appendChild(itemName);
        itemContainer.appendChild(itemCard);
    });
}

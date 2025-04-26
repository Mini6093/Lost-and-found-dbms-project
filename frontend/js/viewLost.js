document.addEventListener('DOMContentLoaded', function() {
    fetchLostItems();
});

function fetchLostItems() {
    fetch('http://localhost:3000/lostitems')
        .then(response => response.json())
        .then(data => displayLostItems(data))
        .catch(error => console.error('Error fetching lost items:', error));
}

function displayLostItems(items) {
    const itemsContainer = document.getElementById('lost-items-list');
    if (items.length === 0) {
        itemsContainer.innerHTML = '<p>No lost items found.</p>';
    } else {
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('lost-item');
            itemElement.innerHTML = `
                <h3>${item.ItemName}</h3>
                <p><strong>Description:</strong> ${item.Description}</p>
                <p><strong>Location:</strong> ${item.LocationID}</p>
                <p><strong>Lost Date:</strong> ${item.LostDate}</p>
                <button onclick="claimItem(${item.ID})">Claim Item</button>
            `;
            itemsContainer.appendChild(itemElement);
        });
    }
}

function claimItem(itemId) {
    // You can add functionality to claim the item here
    alert(`You claimed item with ID: ${itemId}`);
}

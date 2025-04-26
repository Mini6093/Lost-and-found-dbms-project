document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
 
        const formData = {
            ItemName: form.itemName.value,
            Description: form.description.value,
            CategoryID: form.category.value,
            LostDate: form.lostDate.value,
            LocationID: form.location.value,
            UserID: form.userId.value
        };
 
        try {
            const res = await fetch('http://localhost:3000/lostitems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const message = await res.text();
            alert(message);
            form.reset(); // Clear the form after submission
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('Something went wrong. Please try again.');
        }
    });
});
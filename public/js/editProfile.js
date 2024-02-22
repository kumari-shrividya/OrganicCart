document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('editProfileForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        
        // Validate username
        const name = document.getElementById('name').value;
        if (!name || name.length < 2) {
            alert('Username must be at least 2 characters long.');
            return;
        }

        // Validate email
        const email = document.getElementById('email').value;
        if (!email || !isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        const phone=document.getElementById("phoneno").value;
         if(!phone || phone.length<10){
            alert('Phone no must contain 10 digits');
            return;

         }
        // // Validate password
        // const password = document.getElementById('password').value;
        // if (!password || password.length < 5) {
        //     alert('Password must be at least 6 characters long.');
        //     return;
        // }

        // If all validations pass, submit the form
        form.submit();
    });

    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});

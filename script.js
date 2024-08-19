// Wait for the Airtable library to load
window.addEventListener('load', function() {
    if (typeof Airtable === 'undefined') {
        console.error('Airtable library not loaded');
        return;
    }

    // Initialize Airtable
    const base = new Airtable({apiKey: process.env.AIRTABLE_ACCESS_TOKEN}).base(process.env.AIRTABLE_BASE_ID);

    // Function to submit a new post
    function submitPost(event) {
        event.preventDefault();
        
        const text = document.getElementById('post-text').value;
        const imageFile = document.getElementById('post-image').files[0];

        if (!imageFile) {
            console.error('No image file selected');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = function() {
            // Convert image to base64
            const base64Image = reader.result.split(',')[1];

            // Create a new record in Airtable
            base('Posts').create([
                {
                    "fields": {
                        "Text": text,
                        "Image": [{
                            "filename": imageFile.name,
                            "type": imageFile.type,
                            "base64": base64Image
                        }]
                    }
                }
            ], function(err, records) {
                if (err) {
                    console.error('Error creating Airtable record:', err);
                    return;
                }
                console.log("Post created:", records[0].getId());
                document.getElementById('post-form').reset();
                fetchPosts();
            });
        }
        reader.readAsDataURL(imageFile);
    }

    // Function to fetch and display posts
    function fetchPosts() {
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '';

        base('Posts').select({
            sort: [{field: "Created", direction: "desc"}]
        }).eachPage(function page(records, fetchNextPage) {
            records.forEach(function(record) {
                const post = document.createElement('div');
                post.className = 'post';

                const imgUrl = record.get('Image');
                if (imgUrl && imgUrl[0] && imgUrl[0].url) {
                    const img = document.createElement('img');
                    img.src = imgUrl[0].url;
                    post.appendChild(img);
                } else {
                    console.warn('No image URL found for record:', record.getId());
                }

                const p = document.createElement('p');
                p.textContent = record.get('Text') || 'No text provided';
                post.appendChild(p);

                postsContainer.appendChild(post);
            });

            fetchNextPage();
        }, function done(err) {
            if (err) { 
                console.error('Error fetching records:', err); 
                return; 
            }
            console.log('Finished loading posts');
        });
    }

    // Event listeners
    document.getElementById('post-form').addEventListener('submit', submitPost);

    // Initial fetch of posts
    fetchPosts();

    console.log('Script loaded and running');
});
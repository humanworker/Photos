// Initialize Airtable
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(app03xjCFcTcaBqsB);
// Function to submit a new post
function submitPost(event) {
    event.preventDefault();
    
    const text = document.getElementById('post-text').value;
    const imageFile = document.getElementById('post-image').files[0];

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
                console.error(err);
                return;
            }
            console.log("Post created");
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

            const img = document.createElement('img');
            img.src = record.get('Image')[0].url;
            post.appendChild(img);

            const p = document.createElement('p');
            p.textContent = record.get('Text');
            post.appendChild(p);

            postsContainer.appendChild(post);
        });

        fetchNextPage();
    }, function done(err) {
        if (err) { console.error(err); return; }
    });
}

// Event listeners
document.getElementById('post-form').addEventListener('submit', submitPost);
document.addEventListener('DOMContentLoaded', fetchPosts);
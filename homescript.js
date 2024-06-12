let contaierPosts = document.getElementById("posts");
let loginSubmit = document.getElementById("login-submit");
let registerSubmit = document.getElementById("register-submit");
let usernameLogin = document.getElementById("username");
let passwordLogin = document.getElementById("password");
let usernameRegister = document.getElementById("username-register");
let passwordRegister = document.getElementById("password-register");
let nameRegister = document.getElementById("name-register");
let emailRegister = document.getElementById("email-register");
let profileImgRegister = document.getElementById("profile-img-register");
let login = document.getElementById("loginInput");
let logout = document.getElementById("logoutInput");
let createPostModel = document.getElementById("create-post-button");


let baseUrl = `https://tarmeezacademy.com/api/v1`;

// Infinite Scroll
let currentPage = 1; 
let isLoading = false; 
let lastPage = 0;

function getPosts(page = 1, limit = 10) {
  return axios
    .get(`${baseUrl}/posts?page=${page}&limit=${limit}`)
    .then((response) => {
      lastPage = response.data.meta.last_page;
      return response.data.data;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}
let i = 0;
// Add New Posts To Home Page
function addPostsToHomePage() {
  if (isLoading) return; // تأكد من عدم وجود طلبات تحميل جارية
  isLoading = true; // تعيين isLoading إلى true قبل بدء عملية التحميل

  toggleLoader(true);
  getPosts(currentPage)
    .then((data) => {

      if(currentPage == 1) {
        document.getElementById("posts-container").innerHTML = '';
        i=0;
      }

      let content = "";
      let postsContainer = document.getElementById("posts-container");

      let posts = document.createElement("div");
      posts.classList.add("posts");
      posts.setAttribute("id", "posts");

      for (let item of data) {
        // Show Or Hide Edit , Delete Buttons
        let editAndDeleteBtm = ''
        if(localStorage.getItem('token')){
          let idLoginUser = JSON.parse(localStorage.getItem('user')).id;
          let isMyPost = idLoginUser == item.author.id;
          if(isMyPost) {
            editAndDeleteBtm = `
            <div class='edit-delete-post'>
                  <button class="edit-post" onclick="getPostDetails('${encodeURIComponent(JSON.stringify(item))}')">edit</button>
                  <button class="delete-post" onclick='deletePost("${item.id}")'>delete</button>
            </div>
            `
          }
        }
        let postTitle = item.title ? item.title : "";
        content += `<div class="post">
        <div class="head">
          <img onclick='showProfileUser(${item.author.id})' src="${item.author.profile_image}" alt="Profile Image" class="myImage" onerror="this.onerror=null;this.src='./images/imgprofile.png';">
            <div onclick='showProfileUser(${item.author.id})' style='cursor: pointer;'>
              <span class="profile-name">${item.author.name}</span>
              <span class="username">${item.author.username}</span>
            </div>
            ${editAndDeleteBtm}
        </div>
        <div class="body">
            <img src="${item.image}" alt="Post Image" onerror="this.onerror=null;this.src='./images/imgpost.jpg';">
            <div class="info" >
              <span>${item.created_at}</span>
              <h4>${postTitle}</h4>
              <p>${item.body}</p>
            </div>
          </div>
        <div class="foot">
          <div style="position: relative;">
          <i class="fa-solid fa-comment fa-beat"></i>
          <span id='commint-post' onclick='showCommints("${item.id}")'>(${item.comments_count}) Comments</span>
            <span class="heart">
            <i class="fa-solid fa-heart fa-beat" onclick="changeColor(${i})"></i>
            </span>
          </div>
        </div>
      </div>`;
        i++;
      }
      posts.innerHTML = content;
      postsContainer.appendChild(posts);
      isLoading = false;
      console.log(data)
    })
    .catch((err) => {
      console.log(err);
      isLoading = false; 
    }).finally(() => {
      toggleLoader(false);
    })
}

addPostsToHomePage();

// Show Profile Users 
function showProfileUser(idUser) {
  window.location = `./profile.html?userid=${idUser}`
}

// Infinite Scrolling........................
window.addEventListener("scroll", function () {
  if (
    window.scrollY + window.innerHeight + 1 >=
      document.documentElement.scrollHeight &&
    !isLoading &&
    currentPage < lastPage
  ) {
    currentPage++;
    addPostsToHomePage(currentPage);
  }
});

// add Love To Post
function changeColor(index) {
  if (
    document.getElementsByClassName("fa-solid fa-heart")[index].style.color ==
    "red"
  ) {
    document.getElementsByClassName("fa-solid fa-heart")[index].style.color =
      "black";
  } else {
    document.getElementsByClassName("fa-solid fa-heart")[index].style.color =
      "red";
  }
}
//Start Login Processes
function loginModel() {
  var modal = document.getElementById("myModal");
  var btn = document.getElementById("openModalBtn");
  var span = document.getElementsByClassName("close")[0];

  btn.onclick = function () {
    modal.style.display = "block";
  };

  span.onclick = function () {
    modal.style.display = "none";
  };

  document.body.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}

loginSubmit.addEventListener("click", () => {
  loginProcess(usernameLogin.value, passwordLogin.value);
});

function loginProcess(username, password) {
  toggleLoader(true);
  const params = {
    'username': username,
    'password': password,
  };
  const url = `${baseUrl}/login`;
  axios
    .post(url, params)
    .then((response) => {
      let token = response.data.token;

      // profile image
      let profileImage = `
      <img src="${response.data.user.profile_image}" alt="Profile Image" class="myImage" onerror="this.onerror=null;this.src='./images/imgprofile.png';">
      <span>Profile</span>
      <span></span>
      `;
      document.getElementById("profile-image").innerHTML = profileImage;
      localStorage.setItem("profile-image", profileImage);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      document.getElementById("myModal").style.display = "none";
      setupUI();
      showAlert("Successfully logged In", "alert-warning", "alert-success");
      toggle.style.display = "none";
    })
    .catch((error) => {
      let errorMsg = error.response.data.message;
      showAlert(errorMsg, "alert-success", "alert-warning");
    }).finally(() => {
      toggleLoader(false);
    })
}

loginModel();
//End Login Processes

//Start Register Processes
  function registerModel() {
    var modal = document.getElementById("myModalRegister");
    var btn = document.getElementById("openModalBtnRegister");
    var span = document.getElementsByClassName("close")[1];

    btn.onclick = function () {
      modal.style.display = "block";
    };

    span.onclick = function () {
      modal.style.display = "none";
    };

    document.body.addEventListener("click", (event) => {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }

registerSubmit.addEventListener("click", () => {
  registerProcess(
    usernameRegister.value,
    passwordRegister.value,
    nameRegister.value,
    profileImgRegister.files[0],
    emailRegister.value
  );
});

function registerProcess(user, pass, name, img, email) {
  toggleLoader(true);
  let formData = new FormData();
  formData.append("username", user);
  formData.append("password", pass);
  formData.append("image", img);
  formData.append("name", name);
  formData.append("email", email);
  let headers = {
    "Content-Type": "multipart/form-data",
  };
  const url = `${baseUrl}/register`;
  axios
    .post(url, formData, {
      headers: headers,
    })
    .then((response) => {
      document.getElementById("myModalRegister").style.display = "none";
      showAlert(
        "An account has been created successfully",
        "alert-warning",
        "alert-success"
      );
      // set token in localStorage & login the new account
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      let profileImage = `
      <img src="${response.data.user.profile_image}" alt="Profile Image" class="myImage" onerror="this.onerror=null;this.src='./images/imgprofile.png';">
      <span>Profile</span>
      <span></span>
      `;
      localStorage.setItem("profile-image", profileImage);
      toggle.style.display = "none";
      setupUI();
    })
    .catch((error) => {
      let errorMsg = error.response.data.message;
      showAlert(errorMsg, "alert-success", "alert-warning");
    }).finally(() => {
      toggleLoader(false);
    })
}
registerModel();
//End Register Processes

// Show Alert
function showAlert(message, classRemoved, classAdded) {
  var myAlert = document.getElementById("myAlert");
  myAlert.innerHTML = message;
  myAlert.classList.remove("d-none");
  myAlert.classList.remove(classRemoved);
  myAlert.classList.add(classAdded);
  setTimeout(() => {
    myAlert.classList.add("d-none");
  }, 4000);
}

// وَمَا لَكُمْ لَا تُقَاتِلُونَ فِي سَبِيلِ اللَّهِ وَالْمُسْتَضْعَفِينَ مِنَ الرِّجَالِ وَالنِّسَاءِ وَالْوِلْدَانِ الَّذِينَ يَقُولُونَ رَبَّنَا أَخْرِجْنَا مِنْ هَٰذِهِ الْقَرْيَةِ الظَّالِمِ أَهْلُهَا وَاجْعَلْ لَنَا مِنْ لَدُنْكَ وَلِيًّا وَاجْعَلْ لَنَا مِنْ لَدُنْكَ نَصِيرًا
// Get Data From Local Storage And Update Main Screen
function setupUI() {
  const token = localStorage.getItem("token");
  if (token) {
    login.style.display = "none";
    logout.style.display = "block";
    document.getElementById("profile-image").innerHTML =
      localStorage.getItem("profile-image");
    document.getElementById("plus-sign").classList.remove("d-none");
  } else {
    login.style.display = "flex";
    logout.style.display = "none";
    document.getElementById("profile-image").innerHTML = `
  <img src="./images/imgprofile.png" alt="">
  <span>Profile</span>
  <span></span>
  `;
    document.getElementById("plus-sign").classList.add("d-none");
  }
  currentPage = 1; 
  addPostsToHomePage();
}
setupUI();

// logout Process (if you click on button logout)
function logoutProcess() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("profile-image");
  toggle.style.display = "none";
  setupUI();
  showAlert("Successfully logged out", "alert-success", "alert-warning");
}

//Start Add Post Process
function addPostModel() {
  var modal = document.getElementById("myModalPost");
  var btn = document.getElementById("plus-sign");
  var span = document.getElementsByClassName("close")[2];

  btn.onclick = function () {
    modal.style.display = "block";
  };

  span.onclick = function () {
    modal.style.display = "none";
  };

  document.body.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}
createPostModel.addEventListener("click", function () {
  let postTitleValue = document.getElementById("title-post").value;
  let postBodyValue = document.getElementById("body-post").value;
  let postimgValue = document.getElementById("post-img").files[0];
  createPostProcess(postTitleValue, postBodyValue, postimgValue);
});
function createPostProcess(title, body, img) {
  toggleLoader(true);
  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", img);
  let url = `${baseUrl}/posts`;
  let token = localStorage.getItem("token");
  axios
    .post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response);
      document.getElementById("myModalPost").style.display = "none";
      showAlert(
        "The Post has been created successfully",
        "alert-warning",
        "alert-success"
      );
      currentPage = 1; 
      addPostsToHomePage();
    })
    .catch((error) => {
      console.log(error);
      showAlert(`${error.response.data.message}`,"alert-success","alert-warning");
    }).finally(() => {
      toggleLoader(false);
    })
}
addPostModel();
//End Add Post Process

// Responsive
let icon = document.querySelector(".icon");
let toggle = document.querySelector(".toggle");
icon.addEventListener("click", () => {
  if (toggle.style.display == "none") {
    toggle.style.display = "block";
  } else {
    toggle.style.display = "none";
  }
});

// <!--start Commints  -->
// hide the commints menu
function hideCommints() {
  let parent = document.querySelector(".parent")
  parent.style.display = "none";
  }
// hide the commints menu
  function hideCommintsIfClickedInEnptyPlace() {
  let parent = document.querySelector(".parent")

    document.body.addEventListener("click", (event) => {
      if (event.target == parent) {
        parent.style.display = "none";
      }
    });
}
hideCommintsIfClickedInEnptyPlace();

function showCommints(id) {
  let commintWord = document.querySelectorAll("#commint-post")
  let modelCommint = document.querySelector('.parent')
  modelCommint.style.display = 'block';
  addDetailsToCommint(id);
  }

  // add details to commint
  function addDetailsToCommint(id) {
  let modelCommint = document.querySelector('.parent')
  let commentsSection = document.querySelector('.comments-section');
  let addCommintInput = document.querySelector('.add-comment');

  toggleLoader(true);
  axios.get(`${baseUrl}/posts/${id}`)
  .then((response) => {
    let data = response.data.data;
    console.log(data)
    let author = data.author;
    console.log(author);
    let arrayOfComments = data.comments;
    console.log(arrayOfComments)
    let postTitle = data.title ? data.title : "";
  modelCommint.innerHTML =`
  <div class="comment-post">
        <div class="post-header">
          <img
            src=${author.profile_image} alt="Profile Image"class="profile-image" onerror="this.onerror=null;this.src='./images/imgprofile.png';"/>
          <div class="user-info">
            <span class="user-name">${author.name}</span>
            <span class="post-time">${data.created_at}</span>
          </div>
          <i onclick="hideCommints()" class="fa-solid fa-xmark cancel-mark"></i>
        </div>
        <div class="sub">
          <div class="post-body">
            <h3 style="margin: 0;">${postTitle}</h3>
            <p>${data.body}</p>
          </div>
          <div class="img">
            <img src=${data.image} alt="Post Image" onerror="this.onerror=null;this.src='./images/imgpost.jpg';" />
          </div>
          <div class="post-footer">
            <button class="like-button">Like</button>
            <button class="comment-button">Comment</button>
            <button class="share-button">Share</button>
          </div>
        </div>
`
  // add comments to the post
  let comments = '';
      for(let item of arrayOfComments) {
        let comment = `
        <div class="comment">
              <img src=${item.author.profile_image} alt="Profile Image" class="comment-profile-image" onerror="this.onerror=null;this.src='./images/imgprofile.png';"/>
              <div class="comment-content">
                <span class="comment-user-name">${item.author.name}</span>
                <p class="comment-text">${item.body}</p>
              </div>
            </div>
        `
        comments += comment;
      }
      commentsSection.innerHTML = comments;
      document.querySelector('.sub').appendChild(commentsSection)

      // add the input to write comment
      let src = './images/imgprofile.png';
      if(localStorage.getItem('user')) {
        src = JSON.parse(localStorage.getItem('user')).profile_image;
      }
      let addCommint = `
            <img
              src=${src}
              alt="Profile Image"
              class="comment-profile-image"
              onerror="this.onerror=null;this.src='./images/imgprofile.png';"
            />
            <input
              type="text"
              placeholder="Write a comment..."
              class="comment-input"
            />
            <i class="fa-regular fa-paper-plane fa-fade send-comment" onclick='addComment(${id})'></i>
      `
      addCommintInput.innerHTML = addCommint;
      document.querySelector('.sub').appendChild(addCommintInput)
      
  })
  .catch((error) => {
    showAlert(
      `${error.response.data.message}`,
      "alert-success",
      "alert-warning"
    );
  })
  .finally(() => {
    toggleLoader(false);
  })
}

// Add a comment to the Post
function addComment(id) {
  toggleLoader(true);
  let body = document.querySelector('.comment-input').value;
console.log('Adding comment');
let params = {
  "body": body
}
axios.post(`${baseUrl}/posts/${id}/comments`,params,{
  headers: {
    "contentType": 'application/json',
    "Authorization": `Bearer ${localStorage.getItem('token')}`
  }
})
.then((response) => {
  console.log(response);
  addDetailsToCommint(id);
  showAlert(
    "The Comment has been Added successfully",
    "alert-warning",
    "alert-success"
  );
}).catch((error) => {
  showAlert(
    `${error.response.data.message}`,
    "alert-success",
    "alert-warning"
  );
}).finally(() => {
  toggleLoader(false);
})
}
// <!--End Commints  -->

// Start Edit Post's User
function editPostModal() {
  var modal = document.getElementById("myModalEditPost");
  var btn = document.querySelector(".edit-post");
  var span = document.getElementsByClassName("close")[3];

    modal.style.display = "block";
  
  span.onclick = function () {
    modal.style.display = "none";
  };

  document.body.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

}

function getPostDetails(postObj) {
  editPostModal();
  let post = JSON.parse(decodeURIComponent(postObj))
  console.log(post)
  
  document.getElementById('new-title-post').value = post.title;
  document.getElementById('new-body-post').value = post.body;

  updatePost(post);
  }

function updatePost(obj) {

  let updateButton = document.getElementById('Edit-post-button')
  
  updateButton.addEventListener('click', () => {
    toggleLoader(true);
    let url = `${baseUrl}/posts/${obj.id}`
    let title = document.getElementById('new-title-post').value;
    let body = document.getElementById('new-body-post').value;
    let image = document.getElementById('new-post-img').files[0];
    let token = localStorage.getItem('token');
  
    let formData = new FormData();
    formData.append('title', title)
    formData.append('body', body)
    formData.append('image', image)
    formData.append('_method', 'put')

    axios.post(url,formData,{
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response);
      document.getElementById("myModalEditPost").style.display = "none";
      showAlert(
        "The Post has been Updated successfully",
        "alert-warning",
        "alert-success"
      );
      currentPage = 1; 
      addPostsToHomePage();
  })
  .catch((error) => {
    console.log(error);
    showAlert(
      `${error.response.data.message}`,
      "alert-success",
      "alert-warning"
    );
    console.log(image)
  }).finally(() => {
    toggleLoader(false);
  })
  })
}


// End Edit Post's User

// Start Delete Post
function deletePostModal() {
  var modal = document.getElementById("myModalDeletePost");
  var btn = document.querySelector(".edit-post");
  var span = document.getElementsByClassName("close")[4];
  let closeButton = document.getElementById('close-post-button');

    modal.style.display = "block";
  
  span.onclick = function () {
    modal.style.display = "none";
  };

  closeButton.onclick = function () {
    modal.style.display = "none";
  };

  document.body.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

}

function deletePost(id) {
  deletePostModal();
  let deleteButton = document.getElementById('delete-post-button');
  deleteButton.onclick = function () {
    toggleLoader(true);
    
    let url = `${baseUrl}/posts/${id}`
    let token = localStorage.getItem('token');
    let headers = {
      "Authorization": `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    axios.delete(url,{
      headers: headers
    })
    .then((response) => {
      document.getElementById("myModalDeletePost").style.display = "none";
      showAlert(
        "The Post has been Deleted successfully",
        "alert-warning",
        "alert-success"
      );
      currentPage = 1; 
      addPostsToHomePage();
    })
    .catch((error) => {
      console.log(error);
      showAlert(
        `${error.response.data.message}`,
        "alert-success",
        "alert-warning"
      );
      console.log(token)
    }).finally(() => {
      toggleLoader(false);
    })
  }
}
// End Delete Post

// Arrow Up
let arrow = document.querySelector(".arrow-up");
    window.onscroll = function () {
      this.scrollY >= 500 ? arrow.classList.add("show") : arrow.classList.remove("show");
    }
    arrow.onclick = function () {
      window.scrollTo ({
        top : 0 ,
        behavior: "smooth",
      });
    }

// LOADER UPDATE
function toggleLoader(show = true) {
  if(show) {
    document.getElementById("loader").style.visibility = "visible";
    } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}

//The End 
//alhamdulillah 
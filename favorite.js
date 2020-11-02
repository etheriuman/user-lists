// constents -----------------------------

const BASE_API = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_API = BASE_API + 'api/v1/users/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const removeFavoriteButton = document.querySelector('.remove-from-favorite')
const paginator = document.querySelector('.pagination')

const userList = JSON.parse(localStorage.getItem('favoriteUsers')) || []
let pageStatus = 1
let filterUsers = []

const USER_PER_PAGE = 15

// functions ------------------------------

function renderUserList(data) {
  let rawHTML = ''
  data.forEach(user => {
    const userName = user.name
    const userAge = user.age
    const userRegion = user.region
    const userImage = user.avatar
    const userID = user.id

      rawHTML += `
      <div class="card col-sm-3 col-lg-2 m-2 p-2 card-liked">
      <button type="button" class="remove-from-favorite" data-id="${userID}">X</button>
      <img src="${userImage}" class="card-img-top" alt="photo">
      <div class="card-body">
        <div class="main-info h-75">
          <h5 class="card-title text-nowrap">${userName}</h5>
          <p class="card-text">age: ${userAge}</p>
          <p class="card-text">region: ${userRegion}</p>
        </div>
        <a href="#" class="btn col-sm-12 btn-outline-info btn-sm btn-show-info text-nowrap mt-3" data-toggle="modal" data-target="#userModal" data-id="${userID}">more info</a>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function showUserModal(id) {
    const userName = document.querySelector('#user-modal-name')
    const userAge = document.querySelector('#user-modal-age')
    const userRegion = document.querySelector('#user-modal-region')
    const userEmail = document.querySelector('#user-modal-email')
    const userPhoto = document.querySelector('#user-modal-photo')

    axios
      .get(INDEX_API + id)
      .then(response => {
        const userData = response.data
        
        userName.innerHTML = `${userData.name} ${userData.surname}`
        userAge.innerHTML = `Age: ${userData.age}`
        userRegion.innerHTML = `Region: ${userData.region}`
        userEmail.innerHTML = `Email: ${userData.email}`
        userPhoto.innerHTML = `
          <img class="img-fluid col-sm-8 rounded-circle" src="${userData.avatar}" alt="user photo">
        `
        removeFavoriteButton.dataset.id = id
      })
      .catch(error => console.log(error))
}

function renderPaginator(amount) {
  const pageAmount = Math.ceil(amount/USER_PER_PAGE)
  let rawHTML = ''
  for (let i = 1; i <= pageAmount; i++) {
    if (i === pageStatus) {
      rawHTML +=`
      <li class="page-item"><a class="page-link paginator-highlight" href="#" data-page="${i}">${i}</a></li>
    `
    } else {
    rawHTML +=`
      <li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>
    `
    paginator.innerHTML = rawHTML
  }}
}

function romeveUserFromFavorite(id) {
  const userIndex = userList.findIndex(user => user.id === Number(id))
  console.log(userIndex)
  if (userIndex === -1) return
  userList.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(userList))
}

function getUserByPage(page) {
  const startIndex = (page - 1) * USER_PER_PAGE
  return userList.slice(startIndex, startIndex + USER_PER_PAGE)
}

// add event listener -----------------------

dataPanel.addEventListener('click', function infoButtonOnClick(event) {
  if (event.target.matches('.btn-show-info')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.remove-from-favorite')) {
    romeveUserFromFavorite(event.target.dataset.id)
    renderUserList(userList)
    location.reload()
  }
})
removeFavoriteButton.addEventListener('click', function removeFavoriteUser(event) {
  romeveUserFromFavorite(event.target.dataset.id)
  renderUserList(userList)
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filterUsers = userList.filter(user => user.name.toLowerCase().includes(keyword))
  if (!keyword.length) {
    alert('please enter something!')
  } else if (!filterUsers.length) {
    return alert('no user found!!')
  } else {
    renderUserList(filterUsers)
    renderPaginator(filterUsers.length)
  }
})

paginator.addEventListener('click', function paginatorOnClick(event) {
  if (event.target.tagName !== 'A') {
    return
  }
  const id = Number(event.target.dataset.page)
  renderUserList(getUserByPage(id))
  pageStatus = id
  renderPaginator(userList.length)
})


renderUserList(getUserByPage(pageStatus))
renderPaginator(userList.length)

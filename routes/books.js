const controllers = require('../controllers') 
const routes = [
    {
        method: 'GET',
        path: '/books',
        handler: (request, h) => controllers.books.getBooks(request, h),
        options: {
            description: "Get all books and can be filtering with query params",
        }
    },
    {
        method: 'GET',
        path: '/books/{bookId}',
        handler: (request, h) => controllers.books.getBookDetail(request, h),
        options: {
            description: "Get book detail by bookId",
        }
    },
    {
        method: 'POST',
        path: '/books',
        handler: (request, h) => controllers.books.storeBook(request, h),
        options: {
            description: "Store book from input",
        }
    },
    {
        method: 'PUT',
        path: '/books/{bookId}',
        handler: (request, h) => controllers.books.updateBook(request, h),
        options: {
            description: "Update book from input and params",
        }
    },
    {
        method: 'DELETE',
        path: '/books/{bookId}',
        handler: (request, h) => controllers.books.deleteBook(request, h),
        options: {
            description: "Delete book from params",
        }
    }
]

module.exports = routes
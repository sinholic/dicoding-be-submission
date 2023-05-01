const fs = require('fs')
const { nanoid } = require('nanoid')
const plugins = require('../plugins')
const jsonBooks = "books.json"

let books = []

// Get all books with filter from query params 
const getBooks = (request, h) => {
    // reinitialize books for filtering
    let curBooks = books

    //filter reading 
    if (request.query.reading || request.query.reading == 0) {
        curBooks = books.filter((book) => {
            return book.reading == (request.query.reading == 1 ? true : false)
        })
    }

    // filter finished
    if (request.query.finished || request.query.finished == 0) {
        curBooks = books.filter((book) => {
            return book.finished == (request.query.finished == 1 ? true : false)
        })
    }

    // filter name
    if (request.query.name) {
        curBooks = books.filter((book) => {
            return book.name.toLowerCase().includes(request.query.name.toLowerCase())
        })
    }
    curBooks = curBooks.map((curBook) => {
        return {
            'id': curBook.id,
            'name': curBook.name,
            'publisher': curBook.publisher,
        }
    })
    return h.response({
        "status": "success",
        "data": {
            "books": curBooks
        }
    }).code(200)
}

// Get book detail 
const getBookDetail = (request, h) => {
    // reinitialize books for filtering
    try {
        // filter name
        const curBook = books.filter((book) => {
            return book.id === request.params.bookId
        })
        if (curBook.length < 1 ) {
            throw new plugins.validation("Buku tidak ditemukan", 404)
        }
        return h.response({
            "status": "success",
            "data": {
                "book": curBook[0]
            }
        }).code(200)
    } catch (error) {
        return h.response({
            "status": "fail",
            "message": error.message
        }).code(error.code)
    }
}

// Store book to database / file
const storeBook = (request, h) => {
    const payload = request.payload
    try {
        validateCreate(payload)
        const date = new Date().toISOString()
        let book = payload
        book.finished = (payload.pageCount === payload.readPage)
        book.insertedAt = date
        book.updatedAt = date
        book = { id: nanoid(), ...book }
        books.push(book)
        return h.response({
            "status": "success",
            "message": "Buku berhasil ditambahkan",
            "data": {
                "bookId": book.id
            }
        }).code(201)
    } catch (error) {
        return h.response({
            "status": "fail",
            "message": error.message
        }).code(error.code)
    }
}

// Update book to database / file
const updateBook = (request, h) => {
    const payload = request.payload
    try {
        validateUpdate(payload)
        const bookIndex = books.findIndex((book) => {
            return book.id === request.params.bookId
        })
        const curBook = books.filter((book) => {
            return book.id === request.params.bookId
        })

        if (curBook.length < 1 ) {
            throw new plugins.validation("Gagal memperbarui buku. Id tidak ditemukan", 404)
        }
        const date = new Date().toISOString()
        let book = {
            "id": curBook[0].id,
            "name": payload.name,
            "year": payload.year,
            "author": payload.author,
            "summary": payload.summary,
            "publisher": payload.publisher,
            "pageCount": payload.pageCount,
            "readPage": payload.readPage,
            "reading": payload.reading,
            "finished": (payload.pageCount === payload.readPage),
            "insertedAt": curBook[0].insertedAt,
            "updatedAt": date
        } 
        books.splice(0, 1, book)
        return h.response({
            "status": "success",
            "message": "Buku berhasil diperbarui",

        }).code(200)
    } catch (error) {
        return h.response({
            "status": "fail",
            "message": error.message
        }).code(error.code ?? 400)
    }
}

// Delete book from database / file
const deleteBook = (request, h) => {
    try {
        const curBook = books.filter((book) => {
            return book.id === request.params.bookId
        })
        if (curBook.length < 1 ) {
            throw new plugins.validation("Buku gagal dihapus. Id tidak ditemukan", 404)
        }
        books = books.filter((book) => {
            return book.id !== request.params.bookId
        })
        return h.response({
            "status": "success",
            "message": "Buku berhasil dihapus",
        }).code(200)
    } catch (error) {
        console.log(error.message);
        return h.response({
            "status": "fail",
            "message": error.message
        }).code(error.code ?? 400)
    }
}

const validateCreate = (params) => {
    if (!params.name) throw new plugins.validation("Gagal menambahkan buku. Mohon isi nama buku", 400)
    if (!params.year) throw new plugins.validation("Gagal menambahkan buku. Mohon isi tahun buku", 400)
    if (!Number.isInteger(params.year)) throw new plugins.validation("Gagal menambahkan buku. Tahun buku hanya bisa angka", 400)
    if (!params.author) throw new plugins.validation("Gagal menambahkan buku. Mohon isi penulis buku", 400)
    if (!params.summary) throw new plugins.validation("Gagal menambahkan buku. Mohon isi summary buku", 400)
    if (!params.publisher) throw new plugins.validation("Gagal menambahkan buku. Mohon isi penerbit buku", 400)
    if (!params.pageCount) throw new plugins.validation("Gagal menambahkan buku. Mohon isi total halaman buku", 400)
    if (!Number.isInteger(params.pageCount)) throw new plugins.validation("Gagal menambahkan buku. Total halaman buku hanya bisa angka", 400)
    if (!params.readPage && params.readPage < 0) throw new plugins.validation("Gagal menambahkan buku. Mohon isi halaman yang dibaca pada buku", 400)
    if (!Number.isInteger(params.readPage)) throw new plugins.validation("Gagal menambahkan buku. Halaman buku yang dibaca hanya bisa angka", 400)
    if (params.readPage > params.pageCount) throw new plugins.validation("Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount", 400)
    if (typeof params.reading != "boolean") throw new plugins.validation("Gagal menambahkan buku. Reading hanya bisa boolean", 400)
    return
}

const validateUpdate = (params) => {
    if (!params.name) throw new plugins.validation("Gagal memperbarui buku. Mohon isi nama buku", 400)
    if (!params.year) throw new plugins.validation("Gagal memperbarui buku. Mohon isi tahun buku", 400)
    if (!Number.isInteger(params.year)) throw new plugins.validation("Gagal memperbarui buku. Tahun buku hanya bisa angka", 400)
    if (!params.author) throw new plugins.validation("Gagal memperbarui buku. Mohon isi penulis buku", 400)
    if (!params.summary) throw new plugins.validation("Gagal memperbarui buku. Mohon isi summary buku", 400)
    if (!params.publisher) throw new plugins.validation("Gagal memperbarui buku. Mohon isi penerbit buku", 400)
    if (!params.pageCount) throw new plugins.validation("Gagal memperbarui buku. Mohon isi total halaman buku", 400)
    if (!Number.isInteger(params.pageCount)) throw new plugins.validation("Gagal memperbarui buku. Total halaman buku hanya bisa angka", 400)
    if (!params.readPage) throw new plugins.validation("Gagal memperbarui buku. Mohon isi halaman yang dibaca pada buku", 400)
    if (!Number.isInteger(params.readPage)) throw new plugins.validation("Gagal memperbarui buku. Halaman buku yang dibaca hanya bisa angka", 400)
    if (params.readPage > params.pageCount) throw new plugins.validation("Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount", 400)
    if (typeof params.reading != "boolean") throw new plugins.validation("Gagal memperbarui buku. Reading hanya bisa boolean", 400)
    return
}

module.exports = {
    getBooks,
    getBookDetail,
    storeBook,
    updateBook,
    deleteBook,
}

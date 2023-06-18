// Import library yang dibutuhkan
const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

// Inisialisasi server
const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Menyimpan data buku
  const books = [];

  // Menambahkan buku
  server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      // Cek properti name
      if (!name) {
        return h
          .response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
          })
          .code(400);
      }

      // Cek properti readPage dan pageCount
      if (readPage > pageCount) {
        return h
          .response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
          })
          .code(400);
      }

      const id = nanoid();
      const finished = pageCount === readPage;
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };

      books.push(newBook);

      return h
        .response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        })
        .code(201);
    },
  });

  // Menampilkan semua buku
  server.route({
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
      return h
        .response({
          status: 'success',
          data: {
            books: books.map((book) => ({
              id: book.id,
              name: book.name,
              publisher: book.publisher,
            })),
          },
        })
        .code(200);
    },
  });

  // Menampilkan detail buku berdasarkan id
  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;

      const book = books.find((book) => book.id === bookId);

      if (!book) {
        return h
          .response({
            status: 'fail',
            message: 'Buku tidak ditemukan',
          })
          .code(404);
      }

      return h
        .response({
          status: 'success',
          data: {
            book,
          },
        })
        .code(200);
    },
  });

  // Mengubah data buku berdasarkan id
  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;

      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      // Cek properti name
      if (!name) {
        return h
          .response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
          })
          .code(400);
      }

      // Cek properti readPage dan pageCount
      if (readPage > pageCount) {
        return h
          .response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
          })
          .code(400);
      }

      const bookIndex = books.findIndex((book) => book.id === bookId);

      if (bookIndex === -1) {
        return h
          .response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
          })
          .code(404);
      }

      const updatedAt = new Date().toISOString();

      books[bookIndex] = {
        ...books[bookIndex],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
      };

      return h
        .response({
          status: 'success',
          message: 'Buku berhasil diperbarui',
        })
        .code(200);
    },
  });

  // Menghapus buku berdasarkan id
  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;

      const bookIndex = books.findIndex((book) => book.id === bookId);

      if (bookIndex === -1) {
        return h
          .response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
          })
          .code(404);
      }

      books.splice(bookIndex, 1);

      return h
        .response({
          status: 'success',
          message: 'Buku berhasil dihapus',
        })
        .code(200);
    },
  });

  // Menjalankan server
  await server.start();
  console.log('Server running on %s', server.info.uri);
};

// Menjalankan fungsi inisialisasi server
init().catch((err) => {
  console.error(err);
  process.exit(1);
});
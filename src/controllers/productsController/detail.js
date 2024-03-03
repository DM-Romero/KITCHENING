const { Op } = require("sequelize");
const db = require("../../database/models");

module.exports = (req, res) => {
  const { id } = req.params;


  const restoPromise = db.Restaurant.findByPk(id, {
    include: ["images", "category", "address"],
  });


  const bookingsPromise = db.Booking.findAll({
    where: {
      restaurantId: id
    },
    attributes: ['quantity']
  });

  const relatedsPromise = restoPromise.then(resto => {
    if (!resto) return [];
    const categoryId = resto.category.id;
    return db.Restaurant.findAll({
      where: {
        categoryId: categoryId,
        id: { [Op.ne]: id }
      },
      include: ["images"],
      limit: 5 
    });
  });


  Promise.all([restoPromise, bookingsPromise, relatedsPromise])
    .then(([resto, bookings, relateds]) => {
      const total = bookings.map(booking => booking.quantity).reduce((acum, sum) => acum + sum, 0);
      const availability = resto.capacity - total;


      res.render("products/product-detail", {
        ...resto.dataValues,
        availability,
        relateds
      });
    })
    .catch((error) => console.log(error));
};

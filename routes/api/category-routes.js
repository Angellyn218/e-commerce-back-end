const router = require('express').Router();
const { Category, Product, ProductTag } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const CategoryData = await Category.findAll({
      include: [{ model: Product}],
    });
    res.status(200).json(CategoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const CategoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product}],
    });

    if (!CategoryData) {
      res.status(404).json({ message: 'No category found with that id!' });
      return;
    }

    res.status(200).json(CategoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const CategoryData = await Category.create(req.body);
    res.status(200).json(CategoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const CategoryData = await Category.update({
      category_name: req.body.category_name
    }, {
      where: {
        id: req.params.id
      }
    })

    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      res.status(404).json({ message: 'No category found with that id!' });
      return;
    } else if (CategoryData[0] === 0) {
      res.status(404).json({ message: 'Category not updated!' });
      return;
    }

    res.status(200).json({ message: 'Updated Category', category });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product}],
    });

    const CategoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    })

    if (!CategoryData) {
      res.status(404).json({ message: 'No category found with that id!' });
      return;
    }

    res.status(200).json({ message: 'Deleted Category', category });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

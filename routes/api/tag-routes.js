const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const TagData = await Tag.findAll({
      include: [
        { model: Product, through: ProductTag, as: 'products'}
      ]
    });
    res.status(200).json(TagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const TagData = await Tag.findByPk(req.params.id, {
      include: [
        { model: Product, through: ProductTag, as: 'products'}
      ]
    });

    if (!TagData) {
      res.status(404).json({ message: 'No Tag found with that id!' });
      return;
    }

    res.status(200).json(TagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const TagData = await Tag.create(req.body);

    if (req.body.productIds.length) {
      const productTagIdArr = await req.body.productIds.map((product_id) => {
        return {
          product_id, 
          tag_id: TagData.id
        };
      });
      
      const ProductTagData = await ProductTag.bulkCreate(productTagIdArr);

      res.status(200).json(ProductTagData);
    } else {
      res.status(200).json(TagData);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;

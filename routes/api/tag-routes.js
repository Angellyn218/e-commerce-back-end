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
   // update product data
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ product_id }) => product_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.productIds
        .filter((product_id) => !productTagIds.includes(product_id))
        .map((product_id) => {
          return {
            product_id,
            tag_id: req.params.id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tag = await Tag.findByPk(req.params.id);

    const TagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    })

    if (!TagData) {
      res.status(404).json({ message: 'No tag found with that id!' });
      return;
    }

    const productTagsToRemove = await ProductTag.findAll({ where: { tag_id: req.params.id } });

    await ProductTag.destroy({ where: { id: productTagsToRemove } });

    res.status(200).json({ message: 'Deleted Tag', tag });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

// External
const cn = require('classnames');
const html = require('bel');
const url2cmid = require('util-url2cmid');

// Ours
const {ALIGNMENT_PATTERN} = require('../../../constants');
const {grabConfig, $, substitute} = require('../../../utils');
const Caption = require('../Caption');
const Picture = require('../Picture');

function ImageEmbed({
  pictureEl,
  captionEl,
  alignment,
  isFull,
  isCover,
  isAnon
}) {
  if (isCover) {
    isFull = true;
    isAnon = true;
  }

  const className = cn('ImageEmbed', {
    [`u-pull-${alignment}`]: !isFull && alignment,
    'u-pull': !isFull && !alignment,
    'u-full': isFull,
    'is-cover': isCover
  });

  return html`
    <div class="${className}">
      ${pictureEl}
      ${isAnon ? null : captionEl}
    </div>
  `;
};

function transformEl(el, preserveOriginalRatio) {
  const imgEl = $('img', el);

  if (!imgEl) {
    return;
  }

  const suffix = grabConfig(el);
  const [, alignment] = suffix.match(ALIGNMENT_PATTERN) || [];
  const [, smRatio] = suffix.match(Picture.SM_RATIO_PATTERN) || [];
  const [, mdRatio] = suffix.match(Picture.MD_RATIO_PATTERN) || [];
  const [, lgRatio] = suffix.match(Picture.LG_RATIO_PATTERN) || [];

  const src = imgEl.src;
  const alt = imgEl.getAttribute('alt');
  const id = url2cmid(src);
  const linkUrl = `/news/${id}`;

  const imageEmbedEl = ImageEmbed({
    pictureEl: Picture({
      src,
      alt,
      smRatio: smRatio || '3x4',
      mdRatio: mdRatio || '4x3',
      lgRatio,
      preserveOriginalRatio,
      linkUrl
    }),
    captionEl: Caption.createFromEl(el),
    alignment,
    isFull: suffix.indexOf('full') > -1,
    isCover: suffix.indexOf('cover') > -1,
    isAnon: suffix.indexOf('anon') > -1
  });

  substitute(el, imageEmbedEl);
}

module.exports = ImageEmbed;
module.exports.transformEl = transformEl;

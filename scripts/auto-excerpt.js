(function () {
  hexo.extend.filter.register('after_post_render', function (data) {
    if (data.excerpt) {
      return data;
    }
    const excerptLength = hexo.config.excerpt_length || 300;
    const post = data.content;
    const lines = post.split("\n");
    let excerpt = lines[0];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (excerpt.length + line.length > excerptLength) {
        break;
      }
      excerpt += line;
    }
    data.excerpt = excerpt;
    return data;
  });
})();

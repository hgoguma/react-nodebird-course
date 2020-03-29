module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', { // 테이블명은 posts
      content: {
        type: DataTypes.TEXT, // 매우 긴 글 -> 글자수가 얼마나 될지 모를때 보통 TEXT로 씀
        allowNull: false,
      },
    }, {
      charset: 'utf8mb4', //  한글+이모티콘
      collate: 'utf8mb4_general_ci',
    });
    Post.associate = (db) => {
      db.Post.belongsTo(db.User); // 테이블에 UserId 컬럼이 생겨요
      db.Post.hasMany(db.Comment);
      db.Post.hasMany(db.Image);
      db.Post.belongsTo(db.Post, { as: 'Retweet' }); // RetweetId 컬럼 생겨요  -> as : 이름 지어주기
      db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' }); // post - hashtag
      db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' }); //post - 좋아요 
    };
    return Post;
};
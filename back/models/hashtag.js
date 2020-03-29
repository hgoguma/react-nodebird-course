module.exports = (sequelize, DataTypes) => {
    const Hashtag = sequelize.define('Hashtag', {
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
    Hashtag.associate = (db) => {
      db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' }); 
      //belongsToMany : 다대다 관계 -> 중간에 무조건 테이블이 생김 (PostHashtag 테이블 생성됨)
    };
    return Hashtag;
};
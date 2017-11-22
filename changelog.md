# Changelog

## v0.7.2

- Add missing export of `MysqlStore`

## v0.7.1

- Updates Inversify to 4.5.1 and mysql to 2.15.2
- Make `queryOrBuilder` parameter of `MySQLStore.find()` optional


## v0.7.0

- Store and MysqlStore are decorated with `@injectable` and `@unmanaged` decorators from [inversify](https://github.com/inversify)

    > If you decorated those classes in your project, you'll need to remove that code

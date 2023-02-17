# Usage
To install them, add the following to your project's `.npmrc` file:
```
@vechainfoundation:registry=https://npm.pkg.github.com
```
see [Installing a package](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package)

## Authentication
To obtain access to the registry you need to:
- [Create a personal GitHub access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- Either:
    - Use `npm login`
        > ```
        > $ npm login --scope=@vechainfoundation --auth-type=legacy --registry=https://npm.pkg.github.com
        >
        > > Username: USERNAME
        > > Password: TOKEN
        > ```
    - Or add the following line with your credentials in your project's `.npmrc`:
        > ```
        > //npm.pkg.github.com/:_authToken=TOKEN
        > ```
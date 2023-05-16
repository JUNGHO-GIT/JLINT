# prettier-plugin-jsp

Format JSP using Prettier

## .prettierrc

```json
{
  "plugins": ["prettier-plugin-jsp"]
}
```

## VSCode

- Install [Java Server Pages (JSP) extension](https://marketplace.visualstudio.com/items?itemName=pthorsson.vscode-jsp)

- Edit `settings.json`:

  ```json
  {
    "editor.formatOnSave": true,
    "prettier.enable": true,
    "files.associations": {
      "*.jsp": "jsp",
      "*.tag": "jsp"
    },
    "[jsp]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
  }
  ```

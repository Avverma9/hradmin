// src/utils/navUtils.js

export const getPaths = (config) => {
    const paths = [];
  
    const extractPaths = (items) => {
      items.forEach(item => {
        if (item.path) {
          paths.push({ title: item.title, path: item.path });
        }
        if (item.children) {
          extractPaths(item.children); // Recurse into children
        }
      });
    };
  
    extractPaths(config);
    return paths;
  };
  
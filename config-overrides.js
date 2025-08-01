// // config-overrides.js
// const CopyWebpackPlugin = require('copy-webpack-plugin');

// module.exports = function override(config, env) {
//   if (!config.plugins) {
//     config.plugins = [];
//   }

//   config.plugins.push(
//     new CopyWebpackPlugin({
//       patterns: [
//         { 
//           from: 'node_modules/pdfjs-dist/build/pdf.worker.min.js', 
//           to: '' 
//         },
//       ],
//     })
//   );

//   return config;
// }
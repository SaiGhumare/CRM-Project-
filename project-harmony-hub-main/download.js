import https from 'https';
import fs from 'fs';

const file = fs.createWriteStream('src/assets/kbtcoe-logo.png');
https.get('https://upload.wikimedia.org/wikipedia/en/2/29/Karmaveer_Adv._Baburao_Ganpatrao_Thakare_College_of_Engineering_Nashik_logo.png', function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log('Download completed');
  });
}).on('error', function(err) {
  fs.unlink('src/assets/kbtcoe-logo.png', () => {});
  console.error('Error downloading:', err.message);
});

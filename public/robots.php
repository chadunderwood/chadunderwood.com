<?php
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: public, max-age=300, must-revalidate');
echo "User-agent: *\n";
echo "Allow: /\n";
echo "Disallow: /secret\n";
echo "\n";
echo "Sitemap: https://chadunderwood.com/sitemap-index.xml\n";

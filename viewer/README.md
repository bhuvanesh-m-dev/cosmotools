# 🌌 CosmoTools Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with HTML/CSS/JS](https://img.shields.io/badge/Made%20with-HTML%2FCSS%2FJS-blue)](https://developer.mozilla.org/)

**CosmoTools Viewer** is a powerful, client-side code editor and previewer designed for web developers and designers. With a stunning cosmic UI, it allows you to write and test HTML, CSS, and JavaScript in real-time. Share your creations via unique links, QR codes, or downloadable ZIP files.

## ✨ Features

-   **🌠 Immersive Space Theme:** A dynamic, animated space background with stars, nebulae, and shooting stars for an enjoyable coding experience.
-   **📝 Tri-Pane Code Editor:** Separate editors for HTML, CSS, and JavaScript with syntax highlighting, tab support, and a clean interface.
-   **🚀 Live Preview:** Launch your code in a new browser tab with a single click to see your fully rendered webpage.
-   **📦 Project Export:** Download your entire project (HTML, CSS, JS, README) as a single ZIP archive.
-   **🔗 Smart Code Sharing:**
    -   **Share as Code:** Generates a URL containing your code, allowing others to open and edit it directly in the viewer.
    -   **Share as Preview:** Generates a URL that displays the final rendered webpage without showing the underlying code.
-   **📱 QR Code Generator:** Dynamically creates a scannable QR code for your project's preview link. Customize the QR code's style, color, and background.
-   **💾 QR Code Export:** Save your generated QR code as a high-quality PNG or SVG image.
-   **🎨 Glassmorphic UI:** Modern, sleek design with a "glass card" effect, 3D buttons, and smooth animations.

## 🖼️ Demo & Screenshots

Here's a visual walkthrough of the CosmoTools Viewer in action.

### 1. Initial State
The viewer as it appears when first launched. Empty editors are ready for your code.

![Initial Viewer State](https://raw.githubusercontent.com/bhuvanesh-m-dev/cosmotools/refs/heads/main/viewer/img/1.png)

### 2. Pasting Sample Code
After pasting an HTML sample, the editors are populated, and the interface is ready to launch the preview.

![Editors with Sample Code](https://raw.githubusercontent.com/bhuvanesh-m-dev/cosmotools/refs/heads/main/viewer/img/2.png)

### 3. Launching a Preview
Clicking **Launch** opens a new tab with your rendered webpage. The URL shown is a local `blob:` link, demonstrating the client-side nature of the preview.

![Live Preview Window](https://raw.githubusercontent.com/bhuvanesh-m-dev/cosmotools/refs/heads/main/viewer/img/3.png)

### 4. Generated QR Code
The QR code updates dynamically based on your code. You can customize its style and colors, and save it for later use.

![Dynamic QR Code Section](https://raw.githubusercontent.com/bhuvanesh-m-dev/cosmotools/refs/heads/main/viewer/img/4.png)

### 5. "Share as Code" Feature
Clicking **Share as Code** copies a long, comprehensive URL to your clipboard. This URL contains your entire encoded project and can be shared for collaborative editing.

**Example Link:** [`https://bhuvanesh-m-dev.github.io/cosmotools/viewer/?html=%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang%3D%22en%22%3E%0A%3Chead%3E%0A%20%20%20%20%3Cmeta%20charset%3D%22UTF-8%22%3E%0A%20%20%20%20%3Cmeta%20name%3D%22viewport%22%20content%3D%22width%3Ddevice-width%2C%20initial-scale%3D1.0%22%3E%0A%20%20%20%20%3Ctitle%3ESample%20Webpage%3C%2Ftitle%3E%0A%20%20%20%20%0A%20%20%20%20%3C!--%20Basic%20CSS%20Styling%20--%3E%0A%20%20%20%20%3Cstyle%3E%0A%20%20%20%20%20%20%20%20body%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-family%3A%20Arial%2C%20sans-serif%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23f4f7fa%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23333%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20header%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20text-align%3A%20center%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20main%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20max-width%3A%20900px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%2030px%20auto%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%208px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20box-shadow%3A%200%202px%2010px%20rgba(0%2C0%2C0%2C0.1)%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20h1%2C%20h2%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20footer%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20text-align%3A%20center%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2015px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23333%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin-top%3A%2040px%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20button%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2010px%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border%3A%20none%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%205px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20cursor%3A%20pointer%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20button%3Ahover%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%230056b3%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%3C%2Fstyle%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%0A%20%20%20%20%3Cheader%3E%0A%20%20%20%20%20%20%20%20%3Ch1%3EWelcome%20to%20My%20Sample%20Webpage%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EA%20clean%20and%20professional%20HTML%20demonstration%3C%2Fp%3E%0A%20%20%20%20%3C%2Fheader%3E%0A%0A%20%20%20%20%3Cmain%3E%0A%20%20%20%20%20%20%20%20%3Ch2%3EAbout%20This%20Page%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EThis%20is%20a%20basic%20HTML5%20template%20that%20includes%20semantic%20structure%2C%20internal%20CSS%20styling%2C%20and%20responsive%20design%20principles.%3C%2Fp%3E%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Ch2%3EFeatures%20Demonstrated%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%3Cul%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EProper%20document%20structure%20with%20%3Ccode%3E%26lt%3B!DOCTYPE%20html%26gt%3B%3C%2Fcode%3E%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EMeta%20tags%20for%20character%20encoding%20and%20responsiveness%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EInternal%20CSS%20styling%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3ESemantic%20HTML%20elements%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EHover%20effects%20and%20basic%20interactivity%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%3C%2Ful%3E%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Cbutton%20onclick%3D%22alert('Hello!%20Thank%20you%20for%20visiting%20this%20sample%20page.')%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20Click%20Me%0A%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%0A%20%20%20%20%3C%2Fmain%3E%0A%0A%20%20%20%20%3Cfooter%3E%0A%20%20%20%20%20%20%20%20%3Cp%3E%26copy%3B%202026%20Sample%20HTML%20Template.%20All%20rights%20reserved.%3C%2Fp%3E%0A%20%20%20%20%3C%2Ffooter%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E&css=&js=`](https://bhuvanesh-m-dev.github.io/cosmotools/viewer/?html=%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang%3D%22en%22%3E%0A%3Chead%3E%0A%20%20%20%20%3Cmeta%20charset%3D%22UTF-8%22%3E%0A%20%20%20%20%3Cmeta%20name%3D%22viewport%22%20content%3D%22width%3Ddevice-width%2C%20initial-scale%3D1.0%22%3E%0A%20%20%20%20%3Ctitle%3ESample%20Webpage%3C%2Ftitle%3E%0A%20%20%20%20%0A%20%20%20%20%3C!--%20Basic%20CSS%20Styling%20--%3E%0A%20%20%20%20%3Cstyle%3E%0A%20%20%20%20%20%20%20%20body%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-family%3A%20Arial%2C%20sans-serif%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23f4f7fa%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23333%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20header%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20text-align%3A%20center%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20main%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20max-width%3A%20900px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%2030px%20auto%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%208px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20box-shadow%3A%200%202px%2010px%20rgba(0%2C0%2C0%2C0.1)%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20h1%2C%20h2%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20footer%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20text-align%3A%20center%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2015px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23333%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin-top%3A%2040px%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20button%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2010px%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border%3A%20none%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%205px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20cursor%3A%20pointer%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20button%3Ahover%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%230056b3%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%3C%2Fstyle%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%0A%20%20%20%20%3Cheader%3E%0A%20%20%20%20%20%20%20%20%3Ch1%3EWelcome%20to%20My%20Sample%20Webpage%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EA%20clean%20and%20professional%20HTML%20demonstration%3C%2Fp%3E%0A%20%20%20%20%3C%2Fheader%3E%0A%0A%20%20%20%20%3Cmain%3E%0A%20%20%20%20%20%20%20%20%3Ch2%3EAbout%20This%20Page%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EThis%20is%20a%20basic%20HTML5%20template%20that%20includes%20semantic%20structure%2C%20internal%20CSS%20styling%2C%20and%20responsive%20design%20principles.%3C%2Fp%3E%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Ch2%3EFeatures%20Demonstrated%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%3Cul%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EProper%20document%20structure%20with%20%3Ccode%3E%26lt%3B!DOCTYPE%20html%26gt%3B%3C%2Fcode%3E%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EMeta%20tags%20for%20character%20encoding%20and%20responsiveness%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EInternal%20CSS%20styling%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3ESemantic%20HTML%20elements%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EHover%20effects%20and%20basic%20interactivity%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%3C%2Ful%3E%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Cbutton%20onclick%3D%22alert('Hello!%20Thank%20you%20for%20visiting%20this%20sample%20page.')%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20Click%20Me%0A%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%0A%20%20%20%20%3C%2Fmain%3E%0A%0A%20%20%20%20%3Cfooter%3E%0A%20%20%20%20%20%20%20%20%3Cp%3E%26copy%3B%202026%20Sample%20HTML%20Template.%20All%20rights%20reserved.%3C%2Fp%3E%0A%20%20%20%20%3C%2Ffooter%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E&css=&js=)

![Share as Code Link](https://raw.githubusercontent.com/bhuvanesh-m-dev/cosmotools/refs/heads/main/viewer/img/5.png)

### 6. "Share as Preview" Feature
Clicking **Share as Preview** generates a cleaner URL that, when opened, displays only the final rendered output of your code, not the code itself.

**Example Link:** [`https://bhuvanesh-m-dev.github.io/cosmotools/viewer/?preview=true&html=%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang%3D%22en%22%3E%0A%3Chead%3E%0A%20%20%20%20%3Cmeta%20charset%3D%22UTF-8%22%3E%0A%20%20%20%20%3Cmeta%20name%3D%22viewport%22%20content%3D%22width%3Ddevice-width%2C%20initial-scale%3D1.0%22%3E%0A%20%20%20%20%3Ctitle%3ESample%20Webpage%3C%2Ftitle%3E%0A%20%20%20%20%0A%20%20%20%20%3C!--%20Basic%20CSS%20Styling%20--%3E%0A%20%20%20%20%3Cstyle%3E%0A%20%20%20%20%20%20%20%20body%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-family%3A%20Arial%2C%20sans-serif%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23f4f7fa%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23333%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20header%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20text-align%3A%20center%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20main%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20max-width%3A%20900px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%2030px%20auto%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%208px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20box-shadow%3A%200%202px%2010px%20rgba(0%2C0%2C0%2C0.1)%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20h1%2C%20h2%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20footer%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20text-align%3A%20center%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2015px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23333%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin-top%3A%2040px%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20button%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2010px%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border%3A%20none%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%205px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20cursor%3A%20pointer%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20button%3Ahover%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%230056b3%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%3C%2Fstyle%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%0A%20%20%20%20%3Cheader%3E%0A%20%20%20%20%20%20%20%20%3Ch1%3EWelcome%20to%20My%20Sample%20Webpage%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EA%20clean%20and%20professional%20HTML%20demonstration%3C%2Fp%3E%0A%20%20%20%20%3C%2Fheader%3E%0A%0A%20%20%20%20%3Cmain%3E%0A%20%20%20%20%20%20%20%20%3Ch2%3EAbout%20This%20Page%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EThis%20is%20a%20basic%20HTML5%20template%20that%20includes%20semantic%20structure%2C%20internal%20CSS%20styling%2C%20and%20responsive%20design%20principles.%3C%2Fp%3E%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Ch2%3EFeatures%20Demonstrated%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%3Cul%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EProper%20document%20structure%20with%20%3Ccode%3E%26lt%3B!DOCTYPE%20html%26gt%3B%3C%2Fcode%3E%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EMeta%20tags%20for%20character%20encoding%20and%20responsiveness%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EInternal%20CSS%20styling%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3ESemantic%20HTML%20elements%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EHover%20effects%20and%20basic%20interactivity%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%3C%2Ful%3E%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Cbutton%20onclick%3D%22alert('Hello!%20Thank%20you%20for%20visiting%20this%20sample%20page.')%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20Click%20Me%0A%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%0A%20%20%20%20%3C%2Fmain%3E%0A%0A%20%20%20%20%3Cfooter%3E%0A%20%20%20%20%20%20%20%20%3Cp%3E%26copy%3B%202026%20Sample%20HTML%20Template.%20All%20rights%20reserved.%3C%2Fp%3E%0A%20%20%20%20%3C%2Ffooter%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E&css=&js=`](https://bhuvanesh-m-dev.github.io/cosmotools/viewer/?preview=true&html=%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang%3D%22en%22%3E%0A%3Chead%3E%0A%20%20%20%20%3Cmeta%20charset%3D%22UTF-8%22%3E%0A%20%20%20%20%3Cmeta%20name%3D%22viewport%22%20content%3D%22width%3Ddevice-width%2C%20initial-scale%3D1.0%22%3E%0A%20%20%20%20%3Ctitle%3ESample%20Webpage%3C%2Ftitle%3E%0A%20%20%20%20%0A%20%20%20%20%3C!--%20Basic%20CSS%20Styling%20--%3E%0A%20%20%20%20%3Cstyle%3E%0A%20%20%20%20%20%20%20%20body%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-family%3A%20Arial%2C%20sans-serif%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23f4f7fa%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23333%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20header%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20text-align%3A%20center%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20main%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20max-width%3A%20900px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%2030px%20auto%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%208px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20box-shadow%3A%200%202px%2010px%20rgba(0%2C0%2C0%2C0.1)%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20h1%2C%20h2%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20footer%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20text-align%3A%20center%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2015px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23333%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin-top%3A%2040px%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20button%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%23007bff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%2010px%2020px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border%3A%20none%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%205px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20cursor%3A%20pointer%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20button%3Ahover%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background-color%3A%20%230056b3%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%3C%2Fstyle%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%0A%20%20%20%20%3Cheader%3E%0A%20%20%20%20%20%20%20%20%3Ch1%3EWelcome%20to%20My%20Sample%20Webpage%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EA%20clean%20and%20professional%20HTML%20demonstration%3C%2Fp%3E%0A%20%20%20%20%3C%2Fheader%3E%0A%0A%20%20%20%20%3Cmain%3E%0A%20%20%20%20%20%20%20%20%3Ch2%3EAbout%20This%20Page%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EThis%20is%20a%20basic%20HTML5%20template%20that%20includes%20semantic%20structure%2C%20internal%20CSS%20styling%2C%20and%20responsive%20design%20principles.%3C%2Fp%3E%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Ch2%3EFeatures%20Demonstrated%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%3Cul%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EProper%20document%20structure%20with%20%3Ccode%3E%26lt%3B!DOCTYPE%20html%26gt%3B%3C%2Fcode%3E%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EMeta%20tags%20for%20character%20encoding%20and%20responsiveness%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EInternal%20CSS%20styling%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3ESemantic%20HTML%20elements%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3EHover%20effects%20and%20basic%20interactivity%3C%2Fli%3E%0A%20%20%20%20%20%20%20%20%3C%2Ful%3E%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Cbutton%20onclick%3D%22alert('Hello!%20Thank%20you%20for%20visiting%20this%20sample%20page.')%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20Click%20Me%0A%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%0A%20%20%20%20%3C%2Fmain%3E%0A%0A%20%20%20%20%3Cfooter%3E%0A%20%20%20%20%20%20%20%20%3Cp%3E%26copy%3B%202026%20Sample%20HTML%20Template.%20All%20rights%20reserved.%3C%2Fp%3E%0A%20%20%20%20%3C%2Ffooter%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E&css=&js=)

![Share as Preview Link](https://raw.githubusercontent.com/bhuvanesh-m-dev/cosmotools/refs/heads/main/viewer/img/6.png)

## 🚀 Getting Started

You can use the CosmoTools Viewer directly online.

### Online Use

Navigate to the hosted version of the tool:
[https://bhuvanesh-m-dev.github.io/cosmotools/viewer](https://bhuvanesh-m-dev.github.io/cosmotools/viewer)

## 🛠️ How to Use

1.  **Write Code:** Type or paste your HTML, CSS, and JavaScript code into the respective editors.
2.  **Preview:** Click the **Launch** button to see your work in a new tab.
3.  **Share:**
    -   Click **Share as Code** to copy an editable project link.
    -   Click **Share as Preview** to copy a view-only project link.
    -   Scan or download the **QR Code** for easy sharing on mobile devices.
4.  **Save:** Click **Export** to download your entire project as a ZIP file.
5.  **Reset:** Click **Clear** to empty all editors and start fresh.

## 🔧 Built With

-   **HTML5** - Structure
-   **CSS3** - Styling, Animations, Glassmorphism
-   **JavaScript (ES6+)** - Core Logic, Code Management
-   **[QR Code Styling](https://qr-code-styling.com/)** - Dynamic QR Code Generation
-   **[JSZip](https://stuk.github.io/jszip/)** - Project Export Functionality

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, find a bug, or want to improve the code, feel free to:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Bhuvanesh M - [@bhuvanesh-m-dev](https://github.com/bhuvanesh-m-dev)

Project Link: [https://github.com/bhuvanesh-m-dev/cosmotools](https://github.com/bhuvanesh-m-dev/cosmotools)

## 🙏 Acknowledgements

-   [Font Awesome](https://fontawesome.com/) (Referenced via SVG paths)
-   [Google Fonts](https://fonts.google.com/) (Inter & JetBrains Mono)
-   All open-source contributors whose libraries made this tool possible.

<p align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="Footer Banner">
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="Header Banner">
</p>

<h3 align="center">
    🌌 You are my &nbsp;
    <a href="https://github.com/bhuvanesh-m-dev">
    <img src="https://count.getloli.com/@bhuvanesh-m-dev?name=bhuvanesh-m-dev&theme=ai-1&padding=13&offset=0&align=top&scale=1&pixelated=1&darkmode=auto" alt="bhuvanesh-m-dev" />
    </a>
    &nbsp; visitor. Welcome to my orbit.
</h3>

<p align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="Header Banner">
</p>

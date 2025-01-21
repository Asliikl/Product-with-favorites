(() => {
    const loadJQuery = (callback) => {
        const script = document.createElement('script');
        script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
        script.type = "text/javascript";
        script.onload = callback;
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    const init = () => {
        $(document).ready(() => {
            const isProductPage = window.location.href.includes('product');
            if (!isProductPage || !$('.product-detail').length) {
                console.log("Not a valid product page. Exiting script.");
                return;
            }

            buildHTML();
            buildCSS();
            setEvents();
        });
    };

    const buildHTML = () => {
        const html = `
            <div class="custom-carousel">
                <div class="container">
                    <h1>You Might Also Like</h1>
                    <div class="carousel-wrapper">
                        <button class="carousel-arrow left-arrow">&lsaquo;</button>
                        <div class="carousel-container"></div>
                        <button class="carousel-arrow right-arrow">&rsaquo;</button>
                    </div>
                </div>
            </div>
        `;
        $('.product-detail').after(html);
    };

    const buildCSS = () => {
        const css = `
           .container {
                background-color: #f5f5f5;
                padding: 20px;
            }

            .container h1 {
                margin-bottom: 15px;
                text-align: left; 
                color: #333;
                margin-left: 70px; 
                font-family: 'Arial', sans-serif;
            }

            .carousel-wrapper {
                display: flex;
                align-items: center;
                position: relative;
                padding: 20px;
            }

            .carousel-container {
                display: flex;
                overflow-x: auto;
                scroll-behavior: smooth;
                -webkit-overflow-scrolling: touch;
                touch-action: pan-x;
                scrollbar-width: none;
                flex-grow: 1;
                margin: 0 50px;
            }

            .carousel-container div {
                min-width: calc(100% / 6.5);
                margin-right: 10px;
                box-sizing: border-box;
                position: relative;
            }

            .product {
                background: white;
                overflow: hidden;
                text-align: start;
            }

            .product img {
                width: 100%;
                height: auto;
                object-fit: cover;
            }

            .product-name-price {
                padding-left: 15px;
                text-align: left;
            }

            .product-name {
                font-size: 14px;
                color: black;
                margin-bottom: 5px;
            }

            .product-price {
                font-size: 18px;
                font-weight: bold;
                color: #0047AB;
                margin-top: 5px;
            }

            .heart-icon {
                color: #bbb;
                cursor: pointer;
                position: absolute;
                top: 10px;
                right: 10px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 10px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
            }

            .heart-icon.active {
                color: #0047AB;
            }

            .carousel-arrow {
                color: black;
                font-size: 50px;
                cursor: pointer;
                position: absolute;
                z-index: 2;
                top: 50%;
                transform: translateY(-50%);
                border: none;
                background: none; 
                box-shadow: none; 
                padding: 0;
            }

            .left-arrow {
                left: 40px;
            }

            .right-arrow {
                right: 40px;
            }

            @media (max-width: 1024px) {
                .carousel-arrow {
                    display: none;
                }
                .carousel-container {
                    margin: 0;
                }
                .carousel-container div {
                    min-width: 100%;
                }
            }

            @media (max-width: 768px) {
                .custom-carousel {
                    margin: 10px;
                }
                .container h1 {
                    text-align: center; 
                    margin-left: 0;
                    font-size: 14px; 
                }
            }

            @media (max-width: 480px) {
                .custom-carousel {
                    margin: 15px;
                    padding-bottom: 20px;
                }
                .carousel-container div {
                    min-width: 100%;
                }
                .custom-carousel h1 {
                    margin-left: 0; 
                    text-align: center; 
                    font-size: 20px;
                }
            }
        `;
        $('<style>').html(css).appendTo('head');
    };

    const setEvents = () => {
        $('.left-arrow').on('click', function (e) {
            e.preventDefault();
            const container = $('.carousel-container');
            const productWidth = container.find('.product').outerWidth(true);
            container.scrollLeft(container.scrollLeft() - productWidth);
        });

        $('.right-arrow').on('click', function (e) {
            e.preventDefault();
            const container = $('.carousel-container');
            const productWidth = container.find('.product').outerWidth(true);
            container.scrollLeft(container.scrollLeft() + productWidth);
        });

        $('.carousel-container').on('click', '.heart-icon', function () {
            const icon = $(this);
            const productId = icon.closest('.product').data('id');
            let favorited = JSON.parse(localStorage.getItem('favorited')) || {};

            if (icon.hasClass('active')) {
                delete favorited[productId];
            } else {
                favorited[productId] = true;
            }

            localStorage.setItem('favorited', JSON.stringify(favorited));
            icon.toggleClass('active');
        });

        retrieveProducts();
    };

    const retrieveProducts = async () => {
        let products = JSON.parse(localStorage.getItem('products'));
        if (!products) {
            try {
                const response = await fetch('https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                products = await response.json();
                localStorage.setItem('products', JSON.stringify(products));
            } catch (error) {
                console.error('Error fetching products:', error);
                return;
            }
        }
        loadCarousel(products);
    };

    const loadCarousel = (products) => {
        const container = $('.carousel-container');
        const favorited = JSON.parse(localStorage.getItem('favorited')) || {};

        products.forEach(product => {
            const isFavorited = favorited[product.id];
            const productDiv = `
                <div class="product" data-id="${product.id}">
                    <a href="${product.url}" target="_blank" rel="noopener">
                        <img src="${product.img}" alt="${product.name}" loading="lazy">
                    </a>
                    <div class="product-name-price">
                        <p class="product-name">${product.name}</p>
                        <p class="product-price">${product.price} TL</p>
                    </div>
                    <span class="heart-icon ${isFavorited ? 'active' : ''}">&hearts;</span>
                </div>
            `;
            container.append(productDiv);
        });
    };

    loadJQuery(init);
})();
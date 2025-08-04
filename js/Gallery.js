// Clase para manejar galerías 2x2 dinámicas
class Dynamic2x2Gallery {
    constructor(gallerySelector) {
        this.galleries = document.querySelectorAll(gallerySelector);
        this.lightGalleryInstances = [];
        this.init();
    }

    init() {
        // Esperar a que todas las imágenes carguen antes de inicializar
        this.waitForAllImages().then(() => {
            this.galleries.forEach(gallery => {
                this.setupGallery(gallery);
                this.initLightGallery(gallery);
            });

            // Recalcular en resize con debounce
            window.addEventListener('resize', this.debounce(() => {
                this.galleries.forEach(gallery => {
                    this.setupGallery(gallery);
                });
            }, 250));

            window.addEventListener('wololo', this.debounce(() => {
                this.galleries.forEach(gallery => {
                    this.setupGallery(gallery);
                });
            }, 250))
        });
    }

    waitForAllImages() {
        const images = document.querySelectorAll('.dynamic-2x2-gallery img');
        const promises = Array.from(images).map(img => this.waitForImageLoad(img));
        return Promise.all(promises);
    }

    initLightGallery(gallery) {
        try {
            // Destruir instancia existente si existe
            const existingInstance = gallery.lgData;
            if (existingInstance) {
                existingInstance.destroy();
            }

            // Verificar que existen elementos antes de inicializar
            const items = gallery.querySelectorAll('a.gallery-item');
            if (items.length === 0) {
                console.warn('No gallery items found for lightGallery');
                return;
            }
            // Inicializar lightGallery con configuración optimizada
            const lgInstance = lightGallery(gallery, {
                selector: 'a.gallery-item',
                thumbnail: true,
                plugins: [lgZoom, lgThumbnail],

                // Configuración específica para CSS Grid
                speed: 400,
                closable: true,
                counter: true,
                controls: true,
                download: false,

                // Optimizaciones de rendimiento
                preload: 2,
                showAfterLoad: true,

                // Configuración móvil
                mobileSettings: {
                    controls: false,
                    showCloseIcon: true,
                    download: false
                },
            });

            this.lightGalleryInstances.push(lgInstance);

        } catch (error) {
            console.error('Error initializing lightGallery:', error);

            // Fallback: inicializar sin plugins si hay error
            try {
                const fallbackInstance = lightGallery(gallery, {
                    selector: 'a.gallery-item',
                    thumbnail: false
                });
                this.lightGalleryInstances.push(fallbackInstance);
            } catch (fallbackError) {
                console.error('Fallback lightGallery initialization also failed:', fallbackError);
            }
        }
    }

    setupGallery(gallery) {
        // Solo aplicar en desktop
        if (window.innerWidth <= 768) {
            this.resetGallery(gallery);
            return;
        }

        const masterItem = gallery.querySelector('.master-item');
        const wideItem = gallery.querySelector('.wide-item');
        const thirdItem = gallery.querySelector('.third-item');

        if (!masterItem || !wideItem || !thirdItem) return;

        const wideImg = wideItem.querySelector('img');
        const thirdImg = thirdItem.querySelector('img');

        // Esperar a que las imágenes cargen
        Promise.all([
            this.waitForImageLoad(wideImg),
            this.waitForImageLoad(thirdImg)
        ]).then(() => {
            this.calculateDimensions(gallery, masterItem, wideItem, thirdItem);
        });
    }

    waitForImageLoad(img) {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = resolve;
            }
        });
    }

    calculateDimensions(gallery, masterItem, wideItem, thirdItem) {
        const gap = 20; // Gap entre elementos
        const galleryWidth = gallery.offsetWidth;

        // Calcular ancho disponible para cada columna
        const masterWidth = Math.floor((galleryWidth * 2 / 3) - gap);
        const rightColumnWidth = Math.floor((galleryWidth * 1 / 3) - gap);

        // Obtener imágenes
        const wideImg = wideItem.querySelector('img');
        const thirdImg = thirdItem.querySelector('img');

        // Calcular dimensiones del wide
        const wideRatio = wideImg.naturalHeight / wideImg.naturalWidth;
        const wideHeight = Math.floor(rightColumnWidth * wideRatio);

        // Calcular dimensiones del third
        const thirdRatio = thirdImg.naturalHeight / thirdImg.naturalWidth;
        const thirdHeight = Math.floor(rightColumnWidth * thirdRatio);

        // Altura del master = suma de alturas + gap
        const masterHeight = wideHeight + thirdHeight + gap;

        // Aplicar dimensiones
        masterItem.style.width = `${masterWidth}px`;
        masterItem.style.height = `${masterHeight}px`;

        wideItem.style.width = `${rightColumnWidth}px`;
        wideItem.style.height = `${wideHeight}px`;

        thirdItem.style.width = `${rightColumnWidth}px`;
        thirdItem.style.height = `${thirdHeight}px`;

        // Ajustar el grid del contenedor
        gallery.style.gridTemplateColumns = `${masterWidth}px ${rightColumnWidth}px`;
        gallery.style.gridTemplateRows = `${wideHeight}px ${thirdHeight}px`;

    }

    resetGallery(gallery) {
        // Resetear estilos inline para responsive
        const items = gallery.querySelectorAll('.gallery-item');
        items.forEach(item => {
            item.style.width = '';
            item.style.height = '';
        });
        gallery.style.gridTemplateColumns = '';
        gallery.style.gridTemplateRows = '';
    }

    // Método para limpiar instancias
    destroy() {
        this.lightGalleryInstances.forEach(instance => {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        });
        this.lightGalleryInstances = [];
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Funciones originales para galerías masonry
function calculateRowSpan(item, img, rowHeight = 10, rowGap = 20) {
    const aspectRatio = img.naturalHeight / img.naturalWidth;
    const itemWidth = item.offsetWidth;
    const itemHeight = itemWidth * aspectRatio;
    // filas necesarias: ceil((altura + gap) / (rowHeight + gap))
    const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap));
    item.style.setProperty('--row-span', rowSpan);
}

// Calcular y ajustar posiciones de imágenes
function adjustMasonryGrid() {
    // Selecciona tanto la galería principal como las genéricas
    const galleries = document.querySelectorAll('#gallery, .generic-gallery');
    const rowHeight = 10;    // coincide con grid-auto-rows
    const rowGap = 20;    // coincide con grid-gap

    galleries.forEach(gallery => {
        const items = gallery.querySelectorAll('a');
        items.forEach(item => {
            const img = item.querySelector('img');
            if (!img) return;
            if (img.complete) {
                calculateRowSpan(item, img, rowHeight, rowGap);
            } else {
                img.addEventListener('load', () => {
                    calculateRowSpan(item, img, rowHeight, rowGap);
                });
            }
        });
    });
}


function initGenericGalleries() {
    const galleries = document.querySelectorAll('.generic-gallery')
    galleries.forEach(item => {
        lightGallery(item, {
            thumbnail: true,
        })
    })
}

function initDynamic2x2Galleries() {
    // Inicializar galerías 2x2 dinámicas con lightGallery integrado
    const dynamic2x2Gallery = new Dynamic2x2Gallery('.dynamic-2x2-gallery');

    // Guardar referencia global para debugging
    window.dynamic2x2Gallery = dynamic2x2Gallery;
}

// Función de debugging para consola
function debugGallery() {
    const galleries = document.querySelectorAll('[lg-uid]');
    console.log('Gallery instances found:', galleries.length);

    galleries.forEach((gallery, index) => {
        const uid = gallery.getAttribute('lg-uid');
        console.log(`Gallery ${index}:`, {
            element: gallery,
            uid: uid,
            items: gallery.querySelectorAll('a.gallery-item').length
        });
    });
}

export function initGallery() {
    console.log('Initializing galleries...');

    // Verificar que lightGallery está disponible
    if (typeof lightGallery === 'undefined') {
        console.error('lightGallery is not loaded! Check your script imports.');
        return;
    }

    try {
        initGenericGalleries();
        initDynamic2x2Galleries();

        const allMasonry = document.querySelectorAll('#gallery, .generic-gallery');
        allMasonry.forEach(g => lightGallery(g, { thumbnail: true }));

        // Ajusta masonry en carga y en resize
        adjustMasonryGrid();
        window.addEventListener('resize', adjustMasonryGrid);

        // Si quieres, observa mutaciones para galerías dinámicas
        allMasonry.forEach(gallery => {
            const observer = new MutationObserver(adjustMasonryGrid);
            observer.observe(gallery, { childList: true, subtree: true });
        });


        const buttons = document.querySelectorAll('.tab-btn')

        buttons.forEach((button) => {
            if (button.id != 'academic-formation') {
                button.addEventListener('click', adjustMasonryGrid)   
            }
        } )

        const academicFormationBtn = document.getElementById('academic-formation')

        if (academicFormationBtn) {
            academicFormationBtn.addEventListener('click', () => {
                const event = new CustomEvent('wololo')
                window.dispatchEvent(event)
            })
        }


        // Observador para nuevas imágenes en masonry
        if (mainGallery) {
            const observer = new MutationObserver(adjustMasonryGrid);
            observer.observe(mainGallery, {
                childList: true,
                subtree: true
            });
        }

        // Exponer función de debug globalmente
        //window.debugGallery = debugGallery;

        console.log('All galleries initialized successfully');

    } catch (error) {
        console.error('Error initializing galleries:', error);
    }
}
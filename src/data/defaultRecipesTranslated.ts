import { SupportedLanguage } from '../types/i18n';
import { Ingredient } from '../types/recipe';

export interface PreTranslatedContent {
  title: string;
  description: string;
  chefTip?: string;
  ingredients: { id: string; name: string; unit: string }[];
  instructions: string[];
}

export const DEFAULT_RECIPES_TRANSLATIONS: Record<
  string,
  Partial<Record<SupportedLanguage, PreTranslatedContent>>
> = {
  rec_1: {
    en: {
      title: 'Traditional Beef Bourguignon',
      description: 'The great classic of French gastronomy slowly braised in Burgundy red wine, tender carrots, mushrooms and golden bacon lardons.',
      chefTip: 'For a velvety, glossy sauce, reduce the wine by half before adding broth, and make it the day before: reheated, it tastes even better.',
      ingredients: [
        { id: 'i1_1', name: 'Braising beef (chuck or shank)', unit: 'g' },
        { id: 'i1_2', name: 'Smoked bacon lardons', unit: 'g' },
        { id: 'i1_3', name: 'Carrots', unit: 'pcs' },
        { id: 'i1_4', name: 'Button mushrooms', unit: 'g' },
        { id: 'i1_5', name: 'Pearl onions', unit: 'pcs' },
        { id: 'i1_6', name: 'Burgundy red wine', unit: 'cl' },
        { id: 'i1_7', name: 'Beef broth', unit: 'cl' },
        { id: 'i1_8', name: 'All-purpose flour', unit: 'tbsp' },
        { id: 'i1_9', name: 'Garlic cloves', unit: 'pcs' },
        { id: 'i1_10', name: 'Bouquet garni (thyme, bay leaf)', unit: 'pc' },
        { id: 'i1_11', name: 'Salted butter', unit: 'g' },
        { id: 'i1_12', name: 'Freshly ground sea salt & black pepper', unit: 'to taste' }
      ],
      instructions: [
        'Cut the beef into generous 4 cm cubes. Pat them thoroughly dry with paper towels.',
        'In a hot cast-iron Dutch oven with a drizzle of oil and butter, brown the lardons, then set them aside.',
        'Sear the beef cubes over high heat on all sides until nicely golden brown. Sprinkle with flour and stir for 2 minutes.',
        'Add crushed garlic, then pour in red wine and beef broth, scraping browned bits from the bottom.',
        'Add the bouquet garni, cover and simmer over very low heat for 2 hours and 30 minutes.',
        'Clean mushrooms and cut into quarters. Peel carrots and cut into thick rounds.',
        'Sauté pearl onions and mushrooms with butter in a separate pan.',
        'Add carrots, mushrooms, onions, and lardons into the Dutch oven for the final 30 minutes of cooking.',
        'Adjust seasoning with salt and pepper. Serve piping hot with fresh tagliatelle or parsley steamed potatoes.'
      ]
    },
    es: {
      title: 'Buey Bourguignon Tradicional',
      description: 'El gran clásico de la gastronomía francesa cocinado a fuego lento con vino tinto de Borgoña, zanahorias tiernas, champiñones y panceta dorada.',
      chefTip: 'Para una salsa untuosa y brillante, reduce el vino a la mitad antes de añadir el caldo y prepáralo la víspera: recalentado está aún mejor.',
      ingredients: [
        { id: 'i1_1', name: 'Carne de ternera para guisar', unit: 'g' },
        { id: 'i1_2', name: 'Tiras de panceta ahumada', unit: 'g' },
        { id: 'i1_3', name: 'Zanahorias', unit: 'ud' },
        { id: 'i1_4', name: 'Champiñones de París', unit: 'g' },
        { id: 'i1_5', name: 'Cebollitas francesas', unit: 'ud' },
        { id: 'i1_6', name: 'Vino tinto de Borgoña', unit: 'cl' },
        { id: 'i1_7', name: 'Caldo de carne', unit: 'cl' },
        { id: 'i1_8', name: 'Harina de trigo', unit: 'cda' },
        { id: 'i1_9', name: 'Dientes de ajo', unit: 'ud' },
        { id: 'i1_10', name: 'Ramillete de hierbas (tomillo, laurel)', unit: 'ud' },
        { id: 'i1_11', name: 'Mantequilla con sal', unit: 'g' },
        { id: 'i1_12', name: 'Sal y pimienta negra molida', unit: 'al gusto' }
      ],
      instructions: [
        'Corta la carne en dados generosos de unos 4 cm. Sécalos bien con papel absorbente.',
        'En una cazuela de hierro fundido con aceite y mantequilla, dora la panceta y resérvala.',
        'Sella los trozos de carne a fuego vivo por todas partes hasta que tomen un bonito color dorado. Espolvorea la harina y remueve 2 minutos.',
        'Añade el ajo machacado y vierte el vino tinto y el caldo desglasando el fondo.',
        'Añade el ramillete de hierbas, tapa y cocina a fuego muy suave durante 2 horas y 30 minutos.',
        'Limpia los champiñones y córtalos en cuartos. Pela las zanahorias en rodajas gruesas.',
        'Saltea las cebollitas y los champiñones con mantequilla en una sartén aparte.',
        'Incorpora las zanahorias, champiñones, cebollitas y panceta a la cazuela durante los últimos 30 minutos.',
        'Ajusta la sal y la pimienta. Sirve bien caliente con tagliatelle frescos o patatas al vapor con perejil.'
      ]
    }
  },

  rec_2: {
    en: {
      title: 'Crispy Pan-Seared Salmon, Asparagus & Lemon',
      description: 'A golden salmon fillet with ultra-crispy skin and tender flesh, paired with sautéed green asparagus, fresh dill and bright lemon zest.',
      chefTip: 'For ultra-crispy skin, dry the salmon completely with paper towels and salt the skin right before placing it skin-side down in the smoking hot pan.',
      ingredients: [
        { id: 'i2_1', name: 'Fresh salmon fillets (skin-on)', unit: 'pcs' },
        { id: 'i2_2', name: 'Bunch of green asparagus', unit: 'bunch' },
        { id: 'i2_3', name: 'Organic lemon (juice & zest)', unit: 'pc' },
        { id: 'i2_4', name: 'Fresh dill, chopped', unit: 'tbsp' },
        { id: 'i2_5', name: 'Extra virgin olive oil', unit: 'tbsp' },
        { id: 'i2_6', name: 'Unsalted butter', unit: 'g' },
        { id: 'i2_7', name: 'Flaky sea salt & ground black pepper', unit: 'to taste' }
      ],
      instructions: [
        'Wash asparagus, snap off woody ends, and cut diagonally into regular pieces.',
        'Heat olive oil in a skillet over medium heat and sauté asparagus for 5-7 minutes until tender-crisp. Season and set aside.',
        'Salt salmon skin. Heat the skillet with remaining oil over high heat.',
        'Place salmon fillets skin-side down, pressing gently for 30 seconds to prevent curling.',
        'Cook 5 to 6 minutes on skin side without moving until two thirds of the flesh turns opaque.',
        'Add a knob of butter, flip gently to flesh side for 1 minute while spooning foaming butter over the fish.',
        'Plate immediately over warm asparagus, sprinkle with fresh dill, flaky sea salt, and a squeeze of lemon juice.'
      ]
    },
    es: {
      title: 'Lomo de Salmón Crujiente con Espárragos y Limón',
      description: 'Lomo de salmón dorado con piel extra crujiente y carne tierna, acompañado de espárragos verdes salteados, eneldo fresco y ralladura de limón.',
      chefTip: 'Para una piel ultra crujiente, seca perfectamente el salmón con papel absorbente y sala la piel justo antes de ponerlo en la sartén bien caliente.',
      ingredients: [
        { id: 'i2_1', name: 'Lomos de salmón fresco (con piel)', unit: 'ud' },
        { id: 'i2_2', name: 'Manojo de espárragos verdes', unit: 'manojo' },
        { id: 'i2_3', name: 'Limón bio (zumo y ralladura)', unit: 'ud' },
        { id: 'i2_4', name: 'Eneldo fresco picado', unit: 'cda' },
        { id: 'i2_5', name: 'Aceite de oliva virgen extra', unit: 'cda' },
        { id: 'i2_6', name: 'Mantequilla', unit: 'g' },
        { id: 'i2_7', name: 'Flor de sal y pimienta negra molida', unit: 'al gusto' }
      ],
      instructions: [
        'Lava los espárragos verdes, retira la parte dura y córtalos en trozos regulares.',
        'Calienta aceite en una sartén a fuego medio y saltea los espárragos 5-7 minutos hasta que estén tiernos pero crujientes. Sala y reserva.',
        'Sala la piel del salmón. Calienta la sartén con el resto del aceite a fuego vivo.',
        'Coloca los lomos con la piel hacia abajo presionando 30 segundos.',
        'Cocina 5-6 minutos por el lado de la piel sin moverlos.',
        'Añade un trocito de mantequilla, da la vuelta con cuidado 1 minuto regando con la mantequilla.',
        'Emplata sobre los espárragos calientes, añade eneldo fresco, flor de sal y unas gotas de limón.'
      ]
    }
  },

  rec_3: {
    en: {
      title: 'Classic Caramelized French Tarte Tatin',
      description: 'Melt-in-your-mouth apples candied in salted butter caramel, flipped upside down over golden, flaky puff pastry.',
      chefTip: 'Use firm baking apples like Golden or Reinette, and pack them very tightly into the pan as they shrink during baking.',
      ingredients: [
        { id: 'i3_1', name: 'Baking apples (Golden or firm variety)', unit: 'kg' },
        { id: 'i3_2', name: 'All-butter puff pastry sheet', unit: 'roll' },
        { id: 'i3_3', name: 'Granulated sugar', unit: 'g' },
        { id: 'i3_4', name: 'Salted butter (AOP)', unit: 'g' },
        { id: 'i3_5', name: 'Madagascar vanilla bean', unit: 'pc' },
        { id: 'i3_6', name: 'Crème fraîche or thick heavy cream', unit: 'g' }
      ],
      instructions: [
        'Peel apples, core them and cut into thick wedges.',
        'In a 26cm ovenproof skillet, melt sugar with 2 tbsp water over medium heat without stirring until golden caramel forms.',
        'Off heat, stir in diced salted butter and scraped vanilla seeds to stop cooking the caramel.',
        'Arrange apple wedges vertically and tightly in the caramel.',
        'Cook apples gently over low heat for 10-15 minutes so they absorb the caramel.',
        'Preheat oven to 180°C (350°F).',
        'Unroll puff pastry over cooled apples, tucking edges inside the pan.',
        'Prick pastry lightly with a fork to allow steam to escape.',
        'Bake for 30 to 35 minutes until pastry is puffed and deep golden brown.',
        'Let rest for 10 minutes, then invert with a quick motion onto a round serving platter. Serve warm with crème fraîche.'
      ]
    },
    es: {
      title: 'Tarta Tatin Caramelizada Casera',
      description: 'Manzanas fundentes confitadas en caramelo de mantequilla con sal, volcadas sobre hojaldre dorado y crujiente.',
      chefTip: 'Usa manzanas firmes que aguanten la cocción y colócalas bien apretadas, ya que reducen de tamaño al hornear.',
      ingredients: [
        { id: 'i3_1', name: 'Manzanas firmes (tipo Golden o Reineta)', unit: 'kg' },
        { id: 'i3_2', name: 'Lámina de masa de hojaldre', unit: 'rollo' },
        { id: 'i3_3', name: 'Azúcar blanco', unit: 'g' },
        { id: 'i3_4', name: 'Mantequilla con sal', unit: 'g' },
        { id: 'i3_5', name: 'Vaina de vainilla de Madagascar', unit: 'ud' },
        { id: 'i3_6', name: 'Crème fraîche o nata espesa', unit: 'g' }
      ],
      instructions: [
        'Pela las manzanas, descorazónalas y córtalas en cuartos gruesos.',
        'En un molde para tatin o sartén apta para horno, funde el azúcar con 2 cucharadas de agua a fuego medio hasta lograr caramelo dorado.',
        'Fuera del fuego, añade la mantequilla en dados y las semillas de vainilla.',
        'Coloca los cuartos de manzana bien apretados de canto sobre el caramelo.',
        'Cocina a fuego suave 10-15 minutos para que se impregnen de caramelo.',
        'Precalienta el horno a 180°C.',
        'Cubre con el hojaldre remetiendo los bordes hacia el interior.',
        'Pincha la masa con un tenedor.',
        'Hornea de 30 a 35 minutos hasta que esté bien dorado y hojaldrado.',
        'Deja templar 10 minutos antes de desmoldar de un golpe seco sobre un plato grande. Sirve tibia con una cucharada de nata.'
      ]
    }
  },

  rec_4: {
    en: {
      title: 'Creamy Porcini & Parmesan Risotto',
      description: 'Carnaroli rice slowly simmered with white wine and warm vegetable broth, sautéed garlic mushrooms and generous Parmigiano shavings.',
      chefTip: 'The secret to silky risotto is the final mantecatura: turn off heat, vigorously whip in ice-cold diced butter and grated parmesan.',
      ingredients: [
        { id: 'i4_1', name: 'Risotto rice (Carnaroli or Arborio)', unit: 'g' },
        { id: 'i4_2', name: 'Fresh mushrooms & dried porcini', unit: 'g' },
        { id: 'i4_3', name: 'Warm vegetable broth', unit: 'L' },
        { id: 'i4_4', name: 'Dry white wine', unit: 'cl' },
        { id: 'i4_5', name: 'Shallots, finely minced', unit: 'pcs' },
        { id: 'i4_6', name: 'Freshly grated Parmesan cheese', unit: 'g' },
        { id: 'i4_7', name: 'Ice-cold butter, diced', unit: 'g' },
        { id: 'i4_8', name: 'Olive oil', unit: 'tbsp' },
        { id: 'i4_9', name: 'Fresh thyme & black pepper', unit: 'to taste' }
      ],
      instructions: [
        'Rehydrate dried porcini in warm water if using; strain and keep the flavorful liquid.',
        'In a large sauté pan, sweat minced shallots in 1 tbsp olive oil over low heat until soft.',
        'Add rice and toast for 2 minutes stirring until translucent.',
        'Deglaze with dry white wine and let evaporate completely.',
        'Add warm broth ladle by ladle, stirring gently until absorbed before adding more (about 18 minutes).',
        'In another pan, sauté fresh mushrooms with butter and fresh thyme. Season well.',
        'When rice is al dente, turn off heat. Beat in cold butter and parmesan vigorously for the mantecatura.',
        'Fold in three-quarters of sautéed mushrooms.',
        'Serve immediately in warm bowls topped with remaining mushrooms and parmesan shavings.'
      ]
    },
    es: {
      title: 'Risotto Cremoso de Boletus y Parmesano',
      description: 'Arroz Carnaroli cocinado pacientemente con caldo vegetal y vino blanco, setas salteadas al ajo y abundantes lascas de Parmigiano Reggiano.',
      chefTip: 'La clave de un risotto perfecto es la mantecatura final: apaga el fuego antes de incorporar la mantequilla muy fría y el parmesano, mezclando con energía.',
      ingredients: [
        { id: 'i4_1', name: 'Arroz para risotto (Carnaroli o Arborio)', unit: 'g' },
        { id: 'i4_2', name: 'Setas frescas y boletus secos', unit: 'g' },
        { id: 'i4_3', name: 'Caldo de verduras caliente', unit: 'L' },
        { id: 'i4_4', name: 'Vino blanco seco', unit: 'cl' },
        { id: 'i4_5', name: 'Chalotas picadas', unit: 'ud' },
        { id: 'i4_6', name: 'Parmesano recién rallado', unit: 'g' },
        { id: 'i4_7', name: 'Mantequilla muy fría en dados', unit: 'g' },
        { id: 'i4_8', name: 'Aceite de oliva', unit: 'cda' },
        { id: 'i4_9', name: 'Tomillo fresco y pimienta negra', unit: 'al gusto' }
      ],
      instructions: [
        'Hidrata los boletus secos en agua tibia y reserva el caldo colado.',
        'En una cazuela amplia, pocha las chalotas en aceite de oliva a fuego suave.',
        'Añade el arroz y nacara durante 2 minutos hasta que esté translúcido.',
        'Desglasa con el vino blanco seco y deja evaporar por completo.',
        'Añade el caldo caliente cazo a cazo esperando a que se absorba (unos 18 minutos).',
        'Saltea las setas frescas con mantequilla y tomillo fresco en otra sartén.',
        'Con el arroz al dente, apaga el fuego. Añade la mantequilla fría y el parmesano removiendo con vigor.',
        'Incorpora la mayor parte de las setas salteadas.',
        'Sirve de inmediato en platos hondos calientes con las setas restantes y lascas de parmesano.'
      ]
    }
  },

  rec_5: {
    en: {
      title: 'Roasted Red Kuri Squash Velouté with Toasted Seeds',
      description: 'A silky, comforting soup with sweet chestnut notes, enriched with a touch of crème fraîche and crunchy toasted pumpkin seeds.',
      chefTip: 'No need to peel red kuri squash: its thin, tender skin blends completely smooth and yields a gorgeous deep orange color and extra nutrients.',
      ingredients: [
        { id: 'i5_1', name: 'Organic red kuri squash (potimarron)', unit: 'pc (approx 1kg)' },
        { id: 'i5_2', name: 'Yellow onion', unit: 'pc' },
        { id: 'i5_3', name: 'Garlic cloves', unit: 'pcs' },
        { id: 'i5_4', name: 'Warm vegetable or chicken broth', unit: 'cl' },
        { id: 'i5_5', name: 'Heavy cream or coconut cream', unit: 'cl' },
        { id: 'i5_6', name: 'Toasted pumpkin seeds', unit: 'tbsp' },
        { id: 'i5_7', name: 'Grated nutmeg', unit: 'pinch' },
        { id: 'i5_8', name: 'Olive oil', unit: 'tbsp' },
        { id: 'i5_9', name: 'Sea salt & ground pepper', unit: 'to taste' }
      ],
      instructions: [
        'Scrub the squash under warm water, halve, scoop out seeds, and chop unpeeled into large chunks.',
        'In a soup pot, heat olive oil and sauté chopped onion and minced garlic for 3 minutes.',
        'Add squash chunks and sauté 5 minutes to develop sweet, nutty aromas.',
        'Pour in warm broth to cover, cover and simmer gently for 25 minutes until fork-tender.',
        'Purée with an immersion blender until velvety and ultra smooth.',
        'Stir in cream and nutmeg; season with salt and pepper.',
        'Ladle into warm bowls, drizzle with cream, and scatter crunchy toasted pumpkin seeds on top.'
      ]
    },
    es: {
      title: 'Crema de Calabaza Potimarron Asada con Semillas',
      description: 'Una sopa sedosa con agradable aroma a castaña, suavizada con un toque de crema y crujientes semillas de calabaza tostadas.',
      chefTip: 'No hace falta pelar la calabaza potimarron: su piel fina se tritura a la perfección y aporta un color naranja intenso y nutrientes.',
      ingredients: [
        { id: 'i5_1', name: 'Calabaza potimarron ecológica', unit: 'ud (aprox 1kg)' },
        { id: 'i5_2', name: 'Cebolla amarilla', unit: 'ud' },
        { id: 'i5_3', name: 'Dientes de ajo', unit: 'ud' },
        { id: 'i5_4', name: 'Caldo de verduras o ave', unit: 'cl' },
        { id: 'i5_5', name: 'Nata espesa o crema de coco', unit: 'cl' },
        { id: 'i5_6', name: 'Semillas de calabaza tostadas', unit: 'cda' },
        { id: 'i5_7', name: 'Nuez moscada rallada', unit: 'pizca' },
        { id: 'i5_8', name: 'Aceite de oliva', unit: 'cda' },
        { id: 'i5_9', name: 'Sal y pimienta recién molida', unit: 'al gusto' }
      ],
      instructions: [
        'Lava la calabaza, córtala por la mitad, retira las semillas y trocéala con piel.',
        'En una cazuela, calienta aceite y sofríe la cebolla picada y el ajo durante 3 minutos.',
        'Añade los trozos de calabaza y rehoga 5 minutos.',
        'Cubre con caldo caliente, tapa y cocina a fuego suave 25 minutos.',
        'Tritura muy bien con la batidora hasta obtener una textura aterciopelada.',
        'Incorpora la nata y la nuez moscada, ajustando de sal y pimienta.',
        'Sirve en cuencos decorados con un hilo de nata y semillas de calabaza crujientes.'
      ]
    }
  },

  rec_6: {
    en: {
      title: 'Shakshuka with Runny Poached Eggs & Feta',
      description: 'Tender red bell peppers simmered in fragrant spiced tomato sauce (cumin, smoked paprika), topped with gently poached eggs and creamy feta.',
      chefTip: 'For set whites and warm, runny yolks, cover the skillet as soon as you crack the eggs and cook for exactly 4 minutes.',
      ingredients: [
        { id: 'i6_1', name: 'Fresh organic eggs', unit: 'pcs' },
        { id: 'i6_2', name: 'Red bell peppers', unit: 'pcs' },
        { id: 'i6_3', name: 'Canned crushed tomatoes', unit: 'g' },
        { id: 'i6_4', name: 'Greek Feta cheese (PDO)', unit: 'g' },
        { id: 'i6_5', name: 'Red onion', unit: 'pc' },
        { id: 'i6_6', name: 'Garlic cloves', unit: 'pcs' },
        { id: 'i6_7', name: 'Ground cumin', unit: 'tsp' },
        { id: 'i6_8', name: 'Sweet smoked paprika', unit: 'tsp' },
        { id: 'i6_9', name: 'Fresh cilantro leaves', unit: 'handful' },
        { id: 'i6_10', name: 'Olive oil', unit: 'tbsp' }
      ],
      instructions: [
        'Thinly slice red onion and seeded bell peppers.',
        'In a large cast-iron skillet, sauté vegetables in hot olive oil for 8 minutes until tender.',
        'Add minced garlic, cumin and paprika; stir for 1 minute to toast spices.',
        'Pour in crushed tomatoes, season with salt and pepper, and simmer uncovered for 6 minutes.',
        'Make 4 small wells in the tomato sauce using a wooden spoon.',
        'Gently crack an egg into each well.',
        'Cover and cook over medium-low heat for 4 minutes until egg whites are set and yolks remain runny.',
        'Remove from heat, crumble feta cheese on top, scatter fresh cilantro leaves, and serve warm with crusty bread.'
      ]
    },
    es: {
      title: 'Shakshuka con Huevos Escalfados y Feta',
      description: 'Pimientos rojos tiernos en salsa de tomate especiada (comino, pimentón dulce), huevos pochados con yema líquida y queso feta desmenuzado.',
      chefTip: 'Para claras cocidas y yemas líquidas, tapa la sartén en cuanto eches los huevos y cuenta exactamente 4 minutos de cocción.',
      ingredients: [
        { id: 'i6_1', name: 'Huevos frescos ecológicos', unit: 'ud' },
        { id: 'i6_2', name: 'Pimientos rojos', unit: 'ud' },
        { id: 'i6_3', name: 'Tomate triturado en conserva', unit: 'g' },
        { id: 'i6_4', name: 'Queso feta griego DOP', unit: 'g' },
        { id: 'i6_5', name: 'Cebolla roja', unit: 'ud' },
        { id: 'i6_6', name: 'Dientes de ajo', unit: 'ud' },
        { id: 'i6_7', name: 'Comino molido', unit: 'cdta' },
        { id: 'i6_8', name: 'Pimentón dulce ahumado', unit: 'cdta' },
        { id: 'i6_9', name: 'Cilantro fresco', unit: 'puñado' },
        { id: 'i6_10', name: 'Aceite de oliva', unit: 'cda' }
      ],
      instructions: [
        'Corta la cebolla roja y los pimientos limpios en tiras finas.',
        'En una sartén amplia, sofríe las verduras en aceite de oliva durante 8 minutos.',
        'Añade el ajo picado, el comino y el pimentón, removiendo 1 minuto.',
        'Vierte el tomate triturado, salpimienta y deja cocer 6 minutos destapado.',
        'Haz 4 huecos con una cuchara en la salsa.',
        'Casca con cuidado un huevo en cada hueco.',
        'Tapa la sartén y cocina 4 minutos a fuego medio-bajo hasta cuajar las claras.',
        'Retira del fuego, espolvorea feta desmenuzada, hojas de cilantro y pimienta. Acompaña con buen pan.'
      ]
    }
  },

  rec_7: {
    en: {
      title: 'Molten Dark Chocolate Lava Cake 70%',
      description: 'The ultimate dessert: a delicate, airy chocolate crust with a flowing river of warm, intensely rich molten dark chocolate inside.',
      chefTip: 'Baking time is crucial down to the minute: take them out as soon as edges are set but the center still jiggles slightly.',
      ingredients: [
        { id: 'i7_1', name: 'Dark baking chocolate 70%', unit: 'g' },
        { id: 'i7_2', name: 'Unsalted butter', unit: 'g' },
        { id: 'i7_3', name: 'Whole eggs', unit: 'pcs' },
        { id: 'i7_4', name: 'Cane sugar', unit: 'g' },
        { id: 'i7_5', name: 'All-purpose flour', unit: 'g' },
        { id: 'i7_6', name: 'Flaky sea salt', unit: 'pinch' }
      ],
      instructions: [
        'Preheat oven to 200°C (400°F). Butter and flour 4 individual ramekins.',
        'Melt chopped dark chocolate and butter together in a double boiler over very low heat.',
        'In a bowl, whisk whole eggs with sugar vigorously until pale and slightly frothy.',
        'Stir in lukewarm melted chocolate-butter mixture and a pinch of flaky sea salt.',
        'Sift flour over the batter and fold gently with a spatula without overmixing.',
        'Divide mixture evenly between prepared ramekins.',
        'Bake for exactly 9 minutes at 200°C.',
        'Let rest for 2 minutes before unmolding onto plates or serving directly in ramekins with vanilla bean ice cream.'
      ]
    },
    es: {
      title: 'Coulant de Chocolate Negro 70%',
      description: 'El postre irresistible: una corteza suave que esconde un corazón fundido de chocolate negro intenso y caliente.',
      chefTip: 'El tiempo de horneado es clave: retira en cuanto los bordes estén hechos pero el centro todavía tiemble ligeramente.',
      ingredients: [
        { id: 'i7_1', name: 'Chocolate negro para repostería 70%', unit: 'g' },
        { id: 'i7_2', name: 'Mantequilla sin sal', unit: 'g' },
        { id: 'i7_3', name: 'Huevos enteros', unit: 'ud' },
        { id: 'i7_4', name: 'Azúcar de caña', unit: 'g' },
        { id: 'i7_5', name: 'Harina de trigo', unit: 'g' },
        { id: 'i7_6', name: 'Flor de sal', unit: 'pizca' }
      ],
      instructions: [
        'Precalienta el horno a 200°C. Unta con mantequilla y enharina 4 moldes individuales.',
        'Funde el chocolate picado y la mantequilla al baño maría a fuego suave.',
        'En un bol, bate los huevos con el azúcar hasta que la mezcla blanquee ligeramente.',
        'Incorpora la mezcla de chocolate templado y la pizca de flor de sal.',
        'Tamiza la harina por encima y mezcla con una espátula sin trabajar en exceso.',
        'Reparte la masa en los moldes.',
        'Hornea exactamente 9 minutos a 200°C.',
        'Deja reposar 2 minutos antes de desmoldar o servir directamente en el molde con helado de vainilla.'
      ]
    }
  },

  rec_8: {
    en: {
      title: 'Tuna & Cream Cheese Rillettes with Fresh Chives',
      description: 'A quick, fresh and appetizing 5-minute party dip made with white albacore tuna, shallot, tangy lemon juice, and garden-fresh chives.',
      chefTip: 'For an airy, rustic texture, mash with a fork instead of blending to keep delicious little tuna flakes intact.',
      ingredients: [
        { id: 'i8_1', name: 'White albacore tuna in water, drained', unit: 'g' },
        { id: 'i8_2', name: 'Cream cheese (Philadelphia or St Môret)', unit: 'g' },
        { id: 'i8_3', name: 'Bunch of fresh chives, snipped', unit: 'bunch' },
        { id: 'i8_4', name: 'Shallot, finely minced', unit: 'pc' },
        { id: 'i8_5', name: 'Fresh lemon juice', unit: 'tbsp' },
        { id: 'i8_6', name: 'Dijon mustard', unit: 'tsp' },
        { id: 'i8_7', name: 'Espelette pepper or mild smoked paprika', unit: 'pinch' },
        { id: 'i8_8', name: 'Sea salt & ground black pepper', unit: 'to taste' }
      ],
      instructions: [
        'Thoroughly drain tuna and flake with a fork in a mixing bowl.',
        'Add cream cheese, minced shallot, Dijon mustard, and lemon juice.',
        'Mix gently until combined into a creamy yet textured spread.',
        'Fold in three-quarters of snipped fresh chives, season with salt, pepper, and a pinch of Espelette pepper.',
        'Refrigerate for 30 minutes before serving.',
        'Enjoy spread over toasted country sourdough or with crunchy carrot and cucumber sticks.'
      ]
    },
    es: {
      title: 'Rillettes de Atún y Queso Crema con Cebollino',
      description: 'Un paté rápido, fresco y sabroso preparado en 5 minutos con atún blanco, chalota, zumo de limón y cebollino fresco del huerto.',
      chefTip: 'Para una textura aireada y agradable, desmenuza con un tenedor en lugar de batir para conservar trocitos apetitosos.',
      ingredients: [
        { id: 'i8_1', name: 'Atún blanco al natural bien escurrido', unit: 'g' },
        { id: 'i8_2', name: 'Queso crema para untar', unit: 'g' },
        { id: 'i8_3', name: 'Manojo de cebollino fresco picado', unit: 'manojo' },
        { id: 'i8_4', name: 'Chalota finamente picada', unit: 'ud' },
        { id: 'i8_5', name: 'Zumo de limón fresco', unit: 'cda' },
        { id: 'i8_6', name: 'Mostaza de Dijon', unit: 'cdta' },
        { id: 'i8_7', name: 'Pimentón dulce o de Espelette', unit: 'pizca' },
        { id: 'i8_8', name: 'Sal y pimienta', unit: 'al gusto' }
      ],
      instructions: [
        'Escurre muy bien el atún y desmenúzalo con un tenedor en un bol.',
        'Añade el queso crema, la chalota picada, la mostaza y el zumo de limón.',
        'Mezcla bien hasta obtener una consistencia cremosa pero rústica.',
        'Incorpora la mayor parte del cebollino picado, salpimienta y añade una pizca de pimentón.',
        'Refrigera 30 minutos antes de servir.',
        'Disfruta sobre rebanadas de pan tostado o con bastones de zanahoria y pepino crujiente.'
      ]
    }
  }
};

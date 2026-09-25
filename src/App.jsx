import { useMemo, useState } from 'react'

const categories = ['All dishes', 'Breakfast', 'Fasting foods', 'Non fasting foods', 'Burger', 'Noodles', 'Pizza', 'Snack', 'Fish', 'Juice', 'Salad', 'Soup', 'ለስላሳ መጠጦች', 'ተጨማሪ', 'Cold drinks', 'Hot drinks', 'Cream cake', 'Canoe special cake', 'Canoe special torta cake', 'Torta cake', 'Cookies']

const normalizeMenuItems = (items = []) => {
  if (!Array.isArray(items)) return []

  return items
    .filter(Boolean)
    .map((item) => {
      if (Array.isArray(item)) {
        const [name = '', category = 'Breakfast', price = '', description = ''] = item
        return { name, category, price, description }
      }

      return {
        name: item.name ?? '',
        category: item.category ?? 'Breakfast',
        price: item.price ?? '',
        description: item.description ?? ''
      }
    })
}

const initialMenuItems = normalizeMenuItems([
   ['እንቁላል ሳንዱች / Egg Sandwich', 'Breakfast', '260', 'Soft egg and fresh fillings in toasted bread.'],
  ['ስፔሻል እንቁላል ሳንዱች / Special Egg Sandwich', 'Breakfast', '360', 'Our fuller, richer take on a morning classic.'],
  ['እንቁላል ፍርፍር / Egg Firfir', 'Breakfast', '270', 'Torn injera folded through warm seasoned egg.'],
  ['እንቁላል ስልስ / Egg Silis', 'Breakfast', '275', 'Eggs cooked in a flavorful spiced tomato sauce.'],
  ['እንቁላል በስጋ / Egg with Meat', 'Breakfast', '345', 'Scrambled eggs cooked with seasoned minced meat.'],
  ['ፓንኬክ / Pancake', 'Breakfast', '220', 'Golden, tender and made for a slow morning.'],
  ['ኦምሌት / Omlet', 'Breakfast', '225', 'Classic lightly seasoned fried folded egg.'],
  ['ስፔሻል ኦምሌት / Special Omlet', 'Breakfast', '290', 'A fluffy omelet with all the works.'],
  ['ፈጢራ / Fetira', 'Breakfast', '220', 'Flaky, buttery pastry freshly prepared.'],
  ['ስፔሻል ፈጢራ / Special Fetira', 'Breakfast', '330', 'Flaky pastry layered with egg and honey.'],
  ['ጨጨብሳ / Chechebsa', 'Breakfast', '220', 'Shredded flatbread tossed in spiced butter and berbere.'],
  ['ስፔሻል ጨጨብሳ / Special Chechebsa', 'Breakfast', '290', 'Chechebsa served with egg and honey or yogurt.'],
  ['የጤፍ ጨጨብሳ / Teff Chechebsa', 'Breakfast', '230', 'Traditional Chechebsa made with wholesome teff bread.'],
  ['ስፔሻል የጤፍ ጨጨብሳ / S.Teff Chechebsa', 'Breakfast', '300', 'Teff Chechebsa rich with egg, spiced butter, and honey.'],
  ['ፉል / Ful', 'Breakfast', '200', 'Warm mashed fava beans with spices and herbs.'],
  ['ስፔሻል ፉል / Special Ful', 'Breakfast', '260', 'Fava beans topped with chopped egg, yogurt, and fresh veggies.'],
  ['አቮካዶ ፉል / Avocado Ful', 'Breakfast', '210', 'Warm fava beans topped with fresh creamy avocado slices.'],
  ['ፓስታ በእንቁላል / Pasta with Egg', 'Breakfast', '300', 'Warm pasta sautéed with scrambled egg.'],
  ['ሩዝ በእንቁላል / Rice With Egg', 'Breakfast', '300', 'Steamed rice tossed with lightly seasoned egg.'],
  ['አትክልት በዳቦ / Vegitable With Bread', 'Breakfast', '200', 'Sautéed fresh vegetables served with warm bread.'],
  ['ፍሬንች ቶስት / Frinch Tost', 'Breakfast', '210', 'Golden toasted bread soaked in egg batter.'],
  ['ስፔሻል ናሽፍ / Special Nashf', 'Breakfast', '300', 'Dry-sautéed spiced meat and vegetable mix.'],
  ['ኖርማል ናሽፍ/ Normal Nashf', 'Breakfast', '230', 'Standard portion of the day\'s breakfast.'],
  // Non fasting foods
  ['ካኑ ስፔሻል / Canoe Special', 'Non fasting foods', '1950', 'የቤታችን ልዩ ምግብ ከተለያዩ አጃቢ ምግቦች ጋር።'],
  ['ምንችት / Menchet', 'Non fasting foods', '400', 'በቅመም የተሰራ የተፈጨ የስጋ ወጥ።'],
  ['የበግ ጥብስ / Sheep Tibs', 'Non fasting foods', '550', 'በቅመም እና በቃሪያ የተጠበሰ የለስላሳ የበግ ስጋ ጥብስ።'],
  ['ስፔሻል ጥብስ / Special Tibs', 'Non fasting foods', '600', 'በቃሪያ እና ሽንኩርት አጅቦ የሚቀርብ ስፔሻል የስጋ ጥብስ።'],
  ['ጥብስ ፍርፍር / Tibs Firfir', 'Non fasting foods', '490', 'ከየስጋ ጥብስ ጋር የተሰራ ለስላሳ ፍርፍር።'],
  ['ስፔሻል ጥብስ ፍርፍር / Special Tibs Firfir', 'Non fasting foods', '530', 'በተጨማሪ የስጋ ጥብስ እና ግብዓቶች የበለጸገ ፍርፍር።'],
  ['ዱለት / Dulet', 'Non fasting foods', '390', 'በቅመም እና በንጥር ቅቤ የተሰራ ባህላዊ ዱሌት።'],
  ['ክትፎ / Kitfo', 'Non fasting foods', '650', 'በሚጥሚጣ እና በንጥር ቅቤ የታሸ ለስላሳ የሬድ ስጋ ክትፎ።'],
  ['ስፔሻል ክትፎ / Special Kitfo', 'Non fasting foods', '750', 'አይብ እና ጎመን አጅቦ የሚቀርብ ስፔሻል ክትፎ።'],
  ['ስጋ ፍርፍር / Meat Firfir', 'Non fasting foods', '330', 'በቅመም ከተጠበሰ ስጋ ጋር የተሰራ ፍርፍር።'],
  ['ስፔሻል የስጋ ፍርፍር / Special Meat Firfir', 'Non fasting foods', '390', 'በተጨማሪ ስጋ እና እንቁላል ያጌጠ ስፔሻል ፍርፍር።'],

  ['ድርቆሽ ፍርፍር በስጋ / Dirkosh firfir with Kwanta', 'Non fasting foods', '350', 'በደረቀ የቋንጣ ስጋ የተሰራ ድርቆሽ ፍርፍር።'],
  ['ድርቆሽ ፍርፍር በቋንጣ / Dirkosh firfir with Kwanta', 'Non fasting foods', '370', 'በደረቀ የቋንጣ ስጋ የተሰራ ድርቆሽ ፍርፍር።'],
  ['ፓስታ በስጋ / Spageti With Meat', 'Non fasting foods', '320', 'በተፈጨ የስጋ ሶስ የተሰራ ፓስታ።'],
  ['ሩዝ በስጋ / Rice With Meat', 'Non fasting foods', '320', 'ከተጠበሰ የስጋ ክፋዮች ጋር የሚቀርብ ሩዝ።'],
  ['ሽሮ ቦዘና / Shiro Bozena', 'Non fasting foods', '290', 'ከስጋ ክፋዮች ጋር የተቀቀለ ጣፋጭ ሽሮ።'],
  ['ጎመን በስጋ / Gomen With Meat', 'Non fasting foods', '320', 'ከቀይ ስጋ ጋር የተጠበሰ ለስላሳ ጎመን።'],
  ['ቋንጣ ፍርፍር / qwanta Firfir', 'Non fasting foods', '370', 'በደረቀ እና በታሸ የቋንጣ ስጋ የተሰራ ፍርፍር።'],
  ['ስፔሻል ቋንጣ ፍርፍር / S. Kwanta firfir', 'Non fasting foods', '450', 'በተጨማሪ እንቁላል እና ቅቤ ያጌጠ ስፔሻል ቋንጣ ፍርፍር።'],
  ['ግሪል ጥብስ / Grill Tibs', 'Non fasting foods', '550', 'በፍህም ላይ በጥንቃቄ የተጠበሰ የስጋ ጥብስ።'],
  ['ፓስታ ካርቦናራና / Spageti With qarbonara', 'Non fasting foods', '395', 'በክሬም እና በስጋ ሶስ የተሰራ ልዩ ፓስታ።'],
  // Noodles
  ['ስፓጌቲ በስጋ / Spageti With Meat', 'Noodles', '320', 'Comforting pasta finished with our rich meat sauce.'],
  ['ፓስታ በስልስ / Spageti With Silis', 'Noodles', '260', 'Creamy noodles topped with sauce and herbs.'],

  // Burger
  ['ስፔሻል ክለብ ሳንዱች / Special Club Sandwich', 'Burger', '620', 'Stacked with fresh greens, cheese and our house filling.'],
  ['ስፔሻል ዳብል በርገር / Special Duble burger', 'Burger', '695', 'Two juicy patties, cheese, lettuce and tomato.'],
  ['ቺከን በርገር / Chicken Burger', 'Burger', '520', 'Crisp chicken, fresh salad and a toasted bun.'],
  ['ቺዝ በርገር / Cheese Burger', 'Burger', '490', 'Grilled patty with melted cheese and house sauce.'],

  // Pizza
  ['ስፔሻል ፒዛ / Special Pizza', 'Pizza', '530', 'A generous, cheesy house favorite.'],
  ['አትክልት ፒዛ / Vegitable Pizza', 'Pizza', '420', 'Fresh vegetables, herbs and melted cheese.'],
  ['ቺከን ፒዛ / Chicken Pizza', 'Pizza', '560', 'Loaded with savory chicken and mozzarella.'],

  // Soup & Fish
  ['ዶሮ ሾርባ / Chicken Soup', 'Soup', '370', 'Warm, deeply savory and made for slow lunches.'],
  ['አትክልት ሾርባ / Vegitable Soup', 'Soup', '220', 'A bright, comforting bowl of seasonal vegetables.'],
  ['አሳ ሾርባ / Fish Soup', 'Fish', '355', 'Lightly spiced and full of delicate flavor.'],
  ['ግርል አሳ / Grill Fish', 'Fish', '450', 'Delicately grilled, served with fresh sides.'],

  // Cold drinks
  ['ስፔሻል ሞሂቶ / Special Mojito', 'Cold drinks', '185', 'A sparkling, minty cooler with fresh citrus.'],
  ['ስትሮበሪ ሞሂቶ / Strawberry Mojito', 'Cold drinks', '160', 'Fresh strawberry, mint and a lively finish.'],
  ['ብርቱካን ሞሂቶ / Orange Mojito', 'Cold drinks', '160', 'Bright orange with a cooling mint lift.'],
  ['ስፔሻል አምቦ ውሃ በማር / Spe Ambo water with Hony', 'Cold drinks', '150', 'Ambo mineral water blended with natural honey.'],
  ['አምቦ ውሃ በማር / Ambo water with Hony', 'Cold drinks', '125', 'Refreshing Ambo water sweetened with honey.'],
  ['አይስ ኮፊ / Ice Coffee', 'Cold drinks', '120', 'Chilled brewed coffee over ice.'],
  ['አይስ ላቴ / Ice Lati', 'Cold drinks', '180', 'Espresso poured over chilled milk and ice.'],
  ['ካራሜል አይስ ኮፊ / Caramel Ice Coffee', 'Cold drinks', '180', 'Cold coffee infused with rich caramel flavor.'],
  ['አይስ ፍራፓቺኖ / Ice Frapachino', 'Cold drinks', '170', 'Blended iced coffee drink.'],
  ['ስትሮበሪ አይስ ፍራፓቺኖ / Str Ice Frapachino', 'Cold drinks', '170', 'Blended iced coffee with sweet strawberry flavor.'],
  ['ብርቱካን አይስ ፍራፓቺኖ / Orange Ice Frapachino', 'Cold drinks', '170', 'Blended iced coffee with a zesty orange twist.'],
  ['አናናስ አይስ ፍራፓቺኖ / Pineapple Ice Frapachino', 'Cold drinks', '170', 'Blended iced coffee with tropical pineapple.'],
  ['ስፔሻል አይስ ፍራፓቺኖ / Special Ice Frapachino', 'Cold drinks', '210', 'House special blended iced coffee drink.'],
  ['ስፔሻል ሚክስድ አይስ ላቴ / Special Mixed Ice Lati', 'Cold drinks', '220', 'Special blend of iced latte flavors.'],
  ['አቫታር / Avater', 'Cold drinks', '150', 'A refreshing custom mixed specialty cooler.'],
  ['ታይታኒክ ሞሂቶ / Titanic Mojito', 'Cold drinks', '165', 'Cool blue tropical mojito mix.'],
  ['ሌመን ሞሂቶ / Lemon Mojito', 'Cold drinks', '150', 'Classic minty lemonade cooler.'],
  ['ላቭ ሞሂቶ / Love Mojito', 'Cold drinks', '165', 'Sweet fruity mojito blend.'],
  ['ስሙዚ ሞሂቶ / Smoothie Mojito', 'Cold drinks', '165', 'Creamy blended smoothie with a minty kick.'],
  ['ሚክስድ አይስ ላቴ / Mixed Ice Lati', 'Cold drinks', '185', 'Chilled espresso and milk with mixed flavors.'],
  ['ያም ሞሂቶ / Yame Mojito', 'Cold drinks', '175', 'Delicious specialty fruit mojito.'],
  ['ሰንሴት ሞሂቶ / Sensat Mojeto', 'Cold drinks', '175', 'Layered sunset-inspired fruity cooler.'],
  ['ስፔሻል ኮፊ / Special Coffee', 'Cold drinks', '160', 'Signature cold coffee specialty.'],
  ['ኪንግ ሞሂቶ / King Mojeto', 'Cold drinks', '175', 'Rich and bold refreshing mojito.'],
  ['ካራሜል አይስ ላቴ / Caramel Ice Lati', 'Cold drinks', '200', 'Chilled espresso and milk with rich caramel.'],
  ['ሀብሀብ ሞሂቶ / Watermelon Mojito', 'Cold drinks', '150', 'Juicy watermelon blended with fresh mint and citrus.'],

  // Juice
 
  ['ኖርማል ጁስ / Normal Juice', 'Juice', '185', 'Classic refreshing fresh juice blend.'],
  ['ካኖ ስፔሻል ጁስ / Canoe Special Juice', 'Juice', '230', 'Signature house blend packed with tropical flavors.'],
  ['ማንጎ ጁስ / Mango Juice', 'Juice', '185', 'Rich, smooth, and naturally sweet fresh mango.'],
  ['አቮካዶ ጁስ / Avocado Juice', 'Juice', '185', 'Creamy, cool, and blended fresh to order.'],
  ['ፓፓያ ጁስ / Papaya Juice', 'Juice', '185', 'Light, smooth, and full of sweet papaya goodness.'],
  ['ሀብሀብ ጁስ / Watermelon Juice', 'Juice', '185', 'Hydrating, cool, and naturally sweet pure watermelon.'],
  ['አናናስ ጁስ / Pineapple Juice', 'Juice', '220', 'Fresh tropical sweetness in every glass.'],
  ['ህብር ጁስ / Mixed Juice', 'Juice', '210', 'A colorful blend of the day’s freshest fruit.'],

  // Salad
  ['ፍሩት ሳላድ / Fruit Salad', 'Salad', '370', 'Freshly cut fruit, bright and naturally sweet.'],
  ['ሚክስድ ሳላድ / Mixed Salad', 'Salad', '300', 'Crisp greens and colorful garden vegetables.'],
  ['አቮካዶ ሳላድ / Avocado Salad', 'Salad', '290', 'Creamy avocado over fresh, crunchy greens.'],
  ['ቱና ሳላድ / Tuna Salad', 'Salad', '350', 'Flaked tuna served over fresh garden greens.'],
  ['ድንች ሳላድ / Potato Salad', 'Salad', '270', 'Tender diced potatoes tossed with herbs and seasoning.'],
  ['ራሺያን ሳላድ / Russian Salad', 'Salad', '400', 'A generous, creamy classic.'],
  // Hot drinks
 ['አዲሱ ሻይ / Addis Tea', 'Hot drinks', '60', 'A warm classic house tea.'],
  ['ስፔሻል ሻይ / Special Tea', 'Hot drinks', '95', 'Fragrant tea blended with a Canoe touch.'],
  ['ሻይ / Tea', 'Hot drinks', '45', 'Classic hot black tea.'],
  ['ሻይ ለሞን  / Tea Lemon', 'Hot drinks', '65', 'A clean, citrusy cup.'],
  ['ካራቫት ሻይ/ Caravat Tea', 'Hot drinks', '45', 'Warm infused carrot tea.'],
  ['ሞሪንጋ ሻይ / Moringa Tea', 'Hot drinks', '65', 'Nutritious and earthy moringa tea.'],
  ['ሚንት ሻይ/ meant Tea', 'Hot drinks', '65', 'Strong and aromatic black tea.'],
  ['አረንጓዴ ሻይ / Green Tea', 'Hot drinks', '65', 'Light and refreshing green tea.'],
  ['ጦስኒ ሻይ/ tosgni Tea', 'Hot drinks', '65', 'Warm spiced cinnamon infused tea.'],
  ['ብርቱካን ሻይ / orange Tea', 'Hot drinks', '75', 'Classic black tea with creamy milk.'],
  ['ማንጎ ሻይ / Mango Tea', 'Hot drinks', '75', 'Fruity and warm mango-flavored tea.'],
  ['አናናስ ሻይ / Pineapple Tea', 'Hot drinks', '75', 'Warm tea infused with tropical pineapple.'],
  ['ስትሮበሪ ሻይ / Strawberry Tea', 'Hot drinks', '75', 'Sweet and fragrant strawberry tea.'],
  ['ቀረፋ ሻይ / Cinnamon Tea', 'Hot drinks', '65', 'Warm spiced cinnamon infused tea.'],
  ['ሻይ ስፕራይት / Tea Sprite', 'Hot drinks', '65', 'A unique citrus tea blend.'],
  ['የጀበና ቡና / Cultural Coffee', 'Hot drinks', '50', 'Traditionally brewed Ethiopian coffee.'],
  ['ግንፍል ቡና / Ginfil Coffee', 'Hot drinks', '60', 'Traditional boiled Ethiopian style coffee.'],
  ['ቡና ካራቫት / Coffee Caravat', 'Hot drinks', '80', 'Rich espresso layered with rich flavor.'],
  ['ወተት / Milk', 'Hot drinks', '80', 'Fresh warm steamed milk.'],
  ['ማኪያቶ / Macchiato', 'Hot drinks', '75', 'A short espresso touched with silky milk.'],
  ['የጾም ማኪያቶ / Fasting Macchiato', 'Hot drinks', '95', 'Non-dairy macchiato option.'],
  ['ደብል ማኪያቶ / Duble Macchiato', 'Hot drinks', '150', 'Double shot espresso topped with milk foam.'],
  ['ደብል የጾም ማኪያቶ / Double Fasting Macchiato', 'Hot drinks', '180', 'Double shot non-dairy macchiato.'],
  ['ለውዝ / Peanut', 'Hot drinks', '70', 'Warm, creamy peanut drink.'],
  ['ስፔሻል ለውዝ / Special Peanut', 'Hot drinks', '110', 'Rich house special peanut drink.'],
  ['ለውዝ በሻይ / Peanut With Tea', 'Hot drinks', '65', 'A distinct fusion of tea and creamy peanut.'],
  ['ለውዝ በወተት / Peanut With Milk', 'Hot drinks', '90', 'Warm milk blended with rich peanut flavor.'],
  ['ለውዝ በቡና / Peanut With Coffee', 'Hot drinks', '80', 'Unique coffee blended with peanut flavor.'],
  ['ካፑቺኖ / Cappuccino', 'Hot drinks', '120', 'Velvety espresso, steamed milk and a soft crown.'],
  ['ማኪያቶ / Macchiato', 'Hot drinks', '75', 'A short espresso touched with silky milk.'],
  ['ስፔሻል ሻይ / Special Tea', 'Hot drinks', '95', 'Fragrant tea blended with a Canoe touch.'],
  ['ጅንጅብል ሻይ / Ginger Tea', 'Hot drinks', '65', 'Bright ginger warmth, served hot.'],
  ['ሎሚ ሻይ / Tea Lemon', 'Hot drinks', '55', 'A clean, citrusy cup.'],

  // Cakes & Cookies
  ['ክሬም ኬክ / Cream Cake', 'Cream cake', '180', 'Soft, creamy and finished with a light frosting.'],
  ['ካኑ ስፔሻል ኬክ / Canoe Special Cake', 'Canoe special cake', '260', 'A signature cake with a rich Canoe-style finish.'],
  ['ስፔሻል ቶርታ / Special Torta 1kg', 'Canoe special torta cake', '950', 'Our house torta layered with rich flavor and texture.'],
  ['ቶርታ ኬክ / Torta Cake 1kg', 'Torta cake', '800', 'Classic torta cake with a delicate crumb.'],

  // Snacks
  ['ቺፕስ / French Fries', 'Snack', '230', 'Golden, crisp and perfectly salted.'],

  // Fasting foods
  ['የፆም ካኑ ስፔሻል /Fasting Canoe Special', 'Fasting foods', '1100', 'በተለያዩ አትክልቶች እና ቅመሞች ያጌጠ ስፔሻል የፆም ፍርፍር።'],
  ['ስፔሻል የፆም ፍርፍር / Special Fasting Firfir', 'Fasting foods', '260', 'በተለያዩ አትክልቶች እና ቅመሞች ያጌጠ ስፔሻል የፆም ፍርፍር።'],
  ['ድርቆሽ ፍርፍር / Dirkosh Firfir', 'Fasting foods', '240', 'በቅመም እና በቲማቲም ሶስ የተሰራ ጥብስ ድርቆሽ ፍርፍር።'],
  ['ጎመን ክትፎ / Gomen Kitifo', 'Fasting foods', '270', 'በቅመም የታሸ የጎመን ክትፎ።'],
  ['ፓስታ በስልስ / Spageti With Silis', 'Fasting foods', '260', 'በጣፋጭ የቲማቲም ሶስ የተሰራ ፓስታ።'],
  ['ፓስታ በአትክልት / Spageti With Vegetable', 'Fasting foods', '250', 'በጣፋጭ የቲማቲም ሶስ የተሰራ ፓስታ።'],
  ['ሩዝ በአትክልት / Rice With Vegetable', 'Fasting foods', '250', 'ከተለያዩ አትክልቶች ጋር የተጠበሰ ለስላሳ ሩዝ።'],
  ['ድንች ፍርፍር / Potato Firfir', 'Fasting foods', '250', 'ከተጠበሰ ድንች ጋር የተሰራ የፆም ፍርፍር።'],
  ['ስፔሻል ድንች ፍርፍር / Special Potato Firfir', 'Fasting foods', '290', 'በተለያዩ አትክልቶች እና ቅመሞች ያጌጠ ስፔሻል የፆም ፍርፍር።'],
  ['የፆም ፍርፍር / Fasting Firfir', 'Fasting foods', '210', 'በቀለል ያለ ቅመም የተሰራ የፆም ፍርፍር።'],
  ['የፆም ጥብስ / Fasting Tibs', 'Fasting foods', '260', 'በአትክልቶች እና በቅመማ ቅመም የተጠበሰ የፆም ጥብስ።'],
  ['ሽሮ / Shiro', 'Fasting foods', '180', 'በተለየ ሙያ የተሰራ ባህላዊ የሽሮ ወጥ።'],
  ['ሽሮ ላላ / Shiro Lala', 'Fasting foods', '220', 'ቀለል ያለ የቀጠና ሽሮ ወጥ።'],
  ['ተጋቢኖ / Tegabino', 'Fasting foods', '230', 'በትኩስ ድስት የሚቀርብ ፍልፍል ያለ ተጋቢኖ ሽሮ።'],
  ['ስፔሻል ሽሮ / Special Shiro', 'Fasting foods', '260', 'በቅቤና በተለያዩ ግብዓቶች ያጌጠ ስፔሻል ሽሮ።'],
  ['ሱፍ ፍትፍት / Suf Fitfit', 'Fasting foods', '185', 'በቀዝቃዛ የሱፍ ጭማቂ የተሰራ ባህላዊ ፍትፍት።'],
  ['ካሮት ፍርፍር / Carrot Firfir', 'Fasting foods', '185', 'በካሮት እና በአትክልቶች የተሰራ የፆም ፍርፍር።'],
  ['ስፔሻል ድርቆሽ ፍርፍር / Spe. Dirkosh Firfir', 'Fasting foods', '290', 'በተለያዩ አትክልቶች ያጌጠ ስፔሻል ድርቆሽ ፍርፍር።'],
  ['ተልባ ፍትፍት / Telba Fitfit', 'Fasting foods', '200', 'በቅመም የተጠበሰ የዓሳ ጥብስ።'],
  ['ጎመን ጥብስ / Gomen Tibs', 'Fasting foods', '220', 'ከዓሳ ጥብስ ጋር የተሰራ ጣፋጭ ፍርፍር።'],
  ['ሽሮ በጎመን/ Shiro with Gomen', 'Fasting foods', '290', 'ከዓሳ ጥብስ ጋር የተሰራ ጣፋጭ ፍርፍር።'],
  ['ሩዝ በአቮካዶ / Rice With Avocado', 'Fasting foods', '260', 'በትኩስ የአቮካዶ ክፋዮች የታጀበ ለስላሳ ሩዝ።'],
  ['ቡፌ / Baffe', 'Fasting foods', '390', 'የተለያዩ የፆም ምግቦች ስብስብ (ቡፌ)።'],
  ['ቲማቲም ለብለብ / Tomato Lebleb', 'Fasting foods', '230', 'በትኩስ ቲማቲም እና ቃሪያ የተሰራ ሰላጣ።'],
])

function AdminTable({ items, editingItem, setEditingItem, updateItem, removeItem }) {
  const safeItems = Array.isArray(items) ? items : []

  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Description</th><th>Actions</th></tr></thead><tbody>{safeItems.map((item) => {
    if (editingItem === item.name) {
          return <tr key={item.name}><td><input aria-label={`Edit ${item.name} name`} value={item.name} onChange={(event) => { updateItem(item.name, 'name', event.target.value); setEditingItem(event.target.value) }} /></td><td><select aria-label={`Edit ${item.name} category`} value={item.category} onChange={(event) => updateItem(item.name, 'category', event.target.value)}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></td><td><input aria-label={`Edit ${item.name} price`} value={item.price} onChange={(event) => updateItem(item.name, 'price', event.target.value)} /></td><td><input aria-label={`Edit ${item.name} description`} value={item.description} onChange={(event) => updateItem(item.name, 'description', event.target.value)} /></td><td><button className="admin-action primary" type="button" onClick={() => setEditingItem(null)}>Save</button></td></tr>
    }
    return <tr key={item.name}><td>{item.name}</td><td>{item.category}</td><td>{item.price}</td><td>{item.description}</td><td><button className="admin-action" type="button" onClick={() => setEditingItem(item.name)}>Edit</button><button className="admin-action danger" type="button" onClick={() => removeItem(item.name)}>Delete</button></td></tr>
  })}</tbody></table></div>
}

function CommentsTable({ comments, removeComment }) {
  const safeComments = Array.isArray(comments) ? comments : []

  return <section className="comments-admin" aria-labelledby="comments-heading"><div className="comments-heading"><div><p className="eyebrow">Guest feedback</p><h3 id="comments-heading">Customer comments</h3></div><span>{safeComments.length} {safeComments.length === 1 ? 'comment' : 'comments'}</span></div>{safeComments.length ? <div className="comments-list">{safeComments.map((comment) => <article className="comment-item" key={comment.id}><div className="comment-meta"><strong>{comment.name || 'Anonymous guest'}</strong><span>{comment.rating ? `${comment.rating}/5 stars` : 'No rating'}</span></div><p>{comment.text}</p><button className="admin-action danger" type="button" onClick={() => removeComment(comment.id)}>Delete comment</button></article>)}</div> : <p className="comments-empty">Customer comments will appear here after guests submit a review.</p>}</section>
}

function App() {
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [activeCategory, setActiveCategory] = useState('All dishes')
  const [query, setQuery] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [comments, setComments] = useState([])
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', category: 'Breakfast', price: '', description: '' })

  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All dishes' || item.category === activeCategory
    return matchesCategory && `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase())
  }), [activeCategory, menuItems, query])
  const updateItem = (itemName, field, value) => setMenuItems((items) => items.map((item) => item.name === itemName ? { ...item, [field]: value } : item))
  const removeItem = (itemName) => setMenuItems((items) => items.filter((item) => item.name !== itemName))
  const removeComment = (commentId) => setComments((items) => items.filter((item) => item.id !== commentId))
  const addItem = (event) => {
    event.preventDefault()
    if (!newItem.name.trim() || !newItem.price.trim() || !newItem.description.trim()) return
    setMenuItems((items) => [...items, { ...newItem, name: newItem.name.trim(), price: newItem.price.trim(), description: newItem.description.trim() }])
    setNewItem({ name: '', category: 'Breakfast', price: '', description: '' })
  }
  const handleAdminLogin = (event) => {
    event.preventDefault()
    if (adminEmail === 'a@gmail.com' && adminPassword === '1111') { setIsAdmin(true); setShowAdminLogin(false); setLoginError('') } else setLoginError('Incorrect email or password.')
  }

  return (
    <main className="min-h-screen bg-[#efe6d8] text-[#2e1b16]">
      <header className="flex h-16 sm:h-[78px] items-center justify-between bg-[#1d0e0a]/95 px-4 sm:px-[clamp(24px,6vw,92px)] text-[#f5ecdf]">
        <a href="#top" aria-label="Canoe home" className="flex shrink-0 items-center text-inherit no-underline">
          <span className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
            <img src="/logo.png" alt="Canoe logo" className="h-full w-full object-contain" />
          </span>
        </a>

        <button
          type="button"
          onClick={() => document.querySelector('[data-menu-grid]')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-0 bg-[#d98324] px-3.5 py-2 text-[12px] sm:px-4 sm:py-2.5 sm:text-[14px] font-semibold text-[#1a1208] shadow-[0_4px_14px_rgba(217,131,36,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(217,131,36,0.5)]"
        >
          View menu <span className="text-[16px] sm:text-[18px] text-[#d29b71]">↓</span>
        </button>
      </header>

      <section id="top" className="relative overflow-hidden bg-[#351d17] text-[#f7f1e8]">
        <video
          className="absolute inset-0 h-full w-full object-cover brightness-110 contrast-115 saturate-115"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Canoe interior ambience video"
        >
          <source src="/video_2026-09-25_21-46-29.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,12,9,0.55),rgba(22,12,9,0.32)_30%,rgba(22,12,9,0.4)),radial-gradient(circle_at_right,rgba(178,108,69,0.3),transparent_36%)] sm:bg-[linear-gradient(90deg,rgba(22,12,9,0.72),rgba(22,12,9,0.5)_30%,rgba(22,12,9,0.58)),radial-gradient(circle_at_right,rgba(178,108,69,0.35),transparent_36%)]"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto flex min-h-[210px] sm:min-h-[410px] max-w-[1220px] flex-col sm:flex-row items-start sm:items-center justify-center sm:justify-between gap-6 px-5 py-9 sm:px-[clamp(24px,11vw,170px)] sm:py-[77px]">
          <div>
            <p className="mb-2 sm:mb-[22px] text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-[#e7b287]" style={{ fontFamily: '"DM Mono", monospace' }}>Bahirdar</p>
            <h1 className="m-0 text-[clamp(30px,10vw,88px)] leading-[0.98] tracking-[-0.05em] text-[#f7f1e8]" style={{ fontFamily: '"Playfair Display", serif' }}>
              <span className="mb-1.5 sm:mb-[10px] block text-[0.52em] font-medium tracking-[-0.04em]">Welcome to</span>
              <em className="not-italic text-[#f1c093]">Canoe</em>
            </h1>
            <p className="mt-3 sm:mt-[29px] max-w-[250px] sm:max-w-[290px] text-[12px] sm:text-[13px] leading-[1.7] text-white/85">
              A warm table for bright mornings, long lunches, and evenings that take their time.
            </p>
          </div>

          <div className="relative mr-[7%] hidden h-[157px] w-[157px] -rotate-[9deg] flex-col items-center justify-center rounded-full border border-[#eac4a5]/70 bg-[#141209]/25 text-[#f0d0ad] shadow-[0_20px_55px_rgba(0,0,0,0.24)] backdrop-blur-sm sm:flex">
            <div className="absolute inset-[8px] rounded-full border border-[#eac4a5]/70" />
            <span className="relative text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: '"DM Mono", monospace' }}>CAFE</span>
            <strong className="relative my-[3px] mb-[6px] text-[20px]" style={{ fontFamily: '"Playfair Display", serif' }}>CANOE</strong>
            <small className="relative text-[8px] uppercase tracking-[0.08em]">eat · drink · linger</small>
          </div>
        </div>
      </section>

      <section aria-label="Canoe menu" className="mx-auto max-w-[1220px] px-[clamp(24px,6vw,92px)] py-[87px]">
        <div className="mb-[34px] flex items-end justify-between gap-4">
          <div>
            <p className="mb-[12px] text-[10px] uppercase tracking-[0.16em] text-[#b66b45]" style={{ fontFamily: '"DM Mono", monospace' }}>From our kitchen</p>
            <h2 className="m-0 text-[clamp(34px,4vw,52px)] leading-none tracking-[-0.04em] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>Find your favorite</h2>
          </div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#907b6b]" style={{ fontFamily: '"DM Mono", monospace' }}>{filteredItems.length} dishes</p>
        </div>

        <div className="flex h-[66px] items-center border border-[#d8cabb] bg-[#f7f1e8] px-5 transition focus-within:border-[#b66b45] focus-within:shadow-[0_8px_24px_rgba(53,29,23,0.08)]">
          <span aria-hidden="true" className="text-[29px] text-[#b66b45]">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search dishes, drinks, or ingredients"
            aria-label="Search menu"
            className="ml-[14px] flex-1 border-0 bg-transparent text-[14px] text-[#2e1b16] outline-none placeholder:text-[#9d8a7c]"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="mr-3 border-0 bg-transparent text-[22px] text-[#987f6f]">×</button>
          ) : null}
          <kbd className="border border-[#d8cabb] px-2 py-1 text-[10px] text-[#987f6f]" style={{ fontFamily: '"DM Mono", monospace' }}>⌘ K</kbd>
        </div>

        <nav aria-label="Menu categories" className="mt-[30px] flex gap-[27px] overflow-x-auto border-b border-[#d8cabb] pb-[17px] pt-[30px]">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
              className={[
                'relative whitespace-nowrap border-0 bg-transparent pb-[7px] text-[10px] uppercase tracking-[0.08em] transition',
                activeCategory === category ? 'text-[#351d17] after:absolute after:-bottom-[18px] after:left-0 after:right-0 after:h-[2px] after:bg-[#b66b45]' : 'text-[#8d796c]',
              ].join(' ')}
              style={{ fontFamily: '"DM Mono", monospace' }}
            >
              {category}
            </button>
          ))}
        </nav>

        {filteredItems.length ? (
          <div data-menu-grid className="mt-[30px] grid gap-x-[35px] gap-y-0 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => (
              <article
                key={item.name}
                className="relative min-h-[164px] border-b border-[#d8cabb] pb-[22px] pr-[33px] pt-[22px]"
                style={{ animation: 'rise 0.5s both', animationDelay: `${index * 35}ms` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] uppercase tracking-[0.08em] text-[#b66b45]" style={{ fontFamily: '"DM Mono", monospace' }}>{item.category}</span>
                  <span className="text-[14px] font-medium text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>{item.price}</span>
                </div>
                <h3 className="mt-[14px] mb-[7px] text-[22px] leading-tight tracking-[-0.04em] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>{item.name}</h3>
                <p className="m-0 max-w-[225px] text-[11px] leading-[1.65] text-[#88766b]">{item.description}</p>
                <button type="button" aria-label={`Add ${item.name}`} className="absolute bottom-[21px] right-0 flex h-[25px] w-[25px] items-center justify-center rounded-full border border-[#d2c2b4] bg-transparent text-[18px] text-[#b66b45] transition hover:bg-[#e2c7b4]">+</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-[80px] text-center">
            <span className="text-[45px] text-[#b66b45]">⌕</span>
            <h3 className="mt-[10px] mb-0 text-[28px] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>No dishes found</h3>
            <p className="mt-2 text-[12px] text-[#88766b]">Try another search or browse all dishes.</p>
            <button type="button" onClick={() => { setQuery(''); setActiveCategory('All dishes') }} className="mt-3 border-0 bg-[#351d17] px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-white">Reset menu</button>
          </div>
        )}
      </section>

      <section aria-labelledby="review-heading" className="mx-[clamp(24px,6vw,92px)] grid gap-[70px] border-t border-[#d8cabb] py-[72px] md:grid-cols-[minmax(220px,0.8fr)_minmax(300px,1.2fr)]">
        <div>
          <p className="mb-[12px] text-[10px] uppercase tracking-[0.16em] text-[#b66b45]" style={{ fontFamily: '"DM Mono", monospace' }}>A word from you</p>
          <h2 id="review-heading" className="m-0 text-[clamp(32px,4vw,48px)] leading-none tracking-[-0.04em] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>How was your visit?</h2>
          <p className="mt-5 max-w-[250px] text-[12px] leading-[1.7] text-[#88766b]">Tell us what you enjoyed, or what we can make even better.</p>
        </div>

        {reviewSubmitted ? (
          <div className="self-center border border-[#d8cabb] bg-[#f7f1e8] p-[30px]" role="status">
            <span aria-hidden="true" className="text-[26px] text-[#b66b45]">✓</span>
            <h3 className="mt-[12px] mb-[6px] text-[26px] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>Thank you for sharing.</h3>
            <p className="m-0 mb-5 text-[12px] text-[#88766b]">Your review means a lot to the Canoe team.</p>
            <button type="button" onClick={() => setReviewSubmitted(false)} className="inline-flex items-center justify-between border-0 bg-[#351d17] px-4 py-[15px] text-[11px] uppercase tracking-[0.08em] text-[#f7f1e8]">Write another review <span className="ml-2 text-[17px] text-[#d29b71]">↗</span></button>
          </div>
        ) : (
          <form
            className="grid max-w-[520px] gap-[18px]"
            onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              const name = String(formData.get('name') || '').trim()
              const text = String(formData.get('comment') || '').trim()

              if (!text) return

              setComments((items) => [...items, { id: Date.now(), name, text, rating }])
              setReviewSubmitted(true)
              setRating(0)
              event.currentTarget.reset()
            }}
          >
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-[10px] text-[10px] uppercase tracking-[0.08em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>Rate your visit</legend>
              <div className="flex gap-[5px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                    aria-pressed={star === rating}
                    className={[
                      'border-0 bg-transparent p-0 text-[29px] leading-none transition hover:-translate-y-0.5',
                      star <= rating ? 'text-[#b66b45]' : 'text-[#d8cabb]',
                    ].join(' ')}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="grid gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>Name <small className="text-[#a18d7e] normal-case">(optional)</small></span>
              <input name="name" type="text" placeholder="Your name" className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-[15px] py-[14px] text-[13px] text-[#2e1b16] outline-none placeholder:text-[#a18d7e] focus:border-[#b66b45]" />
            </label>

            <label className="grid gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>Comment</span>
              <textarea name="comment" required rows="4" placeholder="Share your experience" className="w-full resize-y border border-[#d8cabb] bg-[#f7f1e8] px-[15px] py-[14px] text-[13px] text-[#2e1b16] outline-none placeholder:text-[#a18d7e] focus:border-[#b66b45]" />
            </label>

            <button type="submit" className="inline-flex w-[155px] items-center justify-between border-0 bg-[#351d17] px-[17px] py-[15px] text-[11px] uppercase tracking-[0.08em] text-[#f7f1e8]">
              Submit review <span className="text-[17px] text-[#d29b71]">↗</span>
            </button>
          </form>
        )}
      </section>

      <footer className="mx-[clamp(24px,6vw,92px)] flex items-center justify-between border-t border-[#d8cabb] py-[24px] text-[9px] uppercase tracking-[0.1em] text-[#907b6b]" style={{ fontFamily: '"DM Mono", monospace' }}>
        <span>CANOE CAFE</span>
        <span>Made for lingering.</span>
        <button type="button" onClick={() => { setShowAdminLogin(true); setLoginError('') }} className="border-0 bg-transparent p-0 text-[#cfc2b7] uppercase tracking-[inherit] hover:text-[#9b897b]">Admin login</button>
      </footer>

      {showAdminLogin ? (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-[#351d17]/60 p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAdminLogin(false)
          }}
        >
          <form onSubmit={handleAdminLogin} className="relative w-full max-w-[420px] bg-[#efe6d8] p-[38px] shadow-[0_20px_60px_rgba(42,22,17,0.24)]">
            <button type="button" onClick={() => setShowAdminLogin(false)} aria-label="Close admin login" className="absolute right-[18px] top-[17px] border-0 bg-transparent text-[25px] leading-none text-[#907b6b]">×</button>
            <p className="mb-[12px] text-[10px] uppercase tracking-[0.16em] text-[#b66b45]" style={{ fontFamily: '"DM Mono", monospace' }}>Canoe management</p>
            <h2 className="m-0 mb-[28px] text-[36px] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>Admin login</h2>

            <label className="mb-[17px] grid gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>Email</span>
              <input autoFocus type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
            </label>

            <label className="mb-[17px] grid gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>Password</span>
              <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
            </label>

            {loginError ? <p className="-mt-1 mb-4 text-[11px] text-[#a44935]" role="alert">{loginError}</p> : null}

            <button type="submit" className="inline-flex w-full items-center justify-between border-0 bg-[#351d17] px-[17px] py-[15px] text-[11px] uppercase tracking-[0.08em] text-[#f7f1e8]">
              Login <span className="text-[17px] text-[#d29b71]">↗</span>
            </button>
          </form>
        </div>
      ) : null}

      {isAdmin ? (
        <section aria-labelledby="admin-heading" className="border-t border-[#d8cabb] bg-[#f7f1e8] px-[clamp(24px,6vw,92px)] py-[66px]">
          <div className="mx-auto mb-[32px] flex max-w-[1400px] items-end justify-between gap-4">
            <div>
              <p className="mb-[11px] text-[10px] uppercase tracking-[0.16em] text-[#b66b45]" style={{ fontFamily: '"DM Mono", monospace' }}>Signed in as admin</p>
              <h2 id="admin-heading" className="m-0 text-[clamp(34px,4vw,50px)] leading-none tracking-[-0.04em] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>Manage menu</h2>
            </div>
            <button type="button" onClick={() => { setIsAdmin(false); setEditingItem(null) }} className="border border-[#d8cabb] bg-transparent px-[13px] py-[11px] text-[10px] uppercase tracking-[0.08em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>Log out</button>
          </div>

          <form onSubmit={addItem} className="mx-auto max-w-[1400px] border-b border-[#d8cabb] pb-[28px]">
            <h3 className="mb-[16px] text-[22px] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>Add a dish</h3>
            <div className="grid gap-2.5 md:grid-cols-[1.1fr_0.9fr_0.5fr_1.5fr_auto]">
              <input aria-label="New dish name" placeholder="Dish name" value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value })} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
              <select aria-label="New dish category" value={newItem.category} onChange={(event) => setNewItem({ ...newItem, category: event.target.value })} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]">
                {categories.slice(1).map((category) => <option key={category}>{category}</option>)}
              </select>
              <input aria-label="New dish price" placeholder="Price" value={newItem.price} onChange={(event) => setNewItem({ ...newItem, price: event.target.value })} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
              <input aria-label="New dish description" placeholder="Description" value={newItem.description} onChange={(event) => setNewItem({ ...newItem, description: event.target.value })} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
              <button type="submit" className="border border-[#351d17] bg-[#351d17] px-2.5 py-2 text-[9px] uppercase tracking-[0.06em] text-[#f7f1e8]" style={{ fontFamily: '"DM Mono", monospace' }}>Add dish</button>
            </div>
          </form>

          <div className="mx-auto max-w-[1400px] overflow-x-auto">
            <AdminTable items={menuItems} editingItem={editingItem} setEditingItem={setEditingItem} updateItem={updateItem} removeItem={removeItem} />
          </div>

          <CommentsTable comments={comments} removeComment={removeComment} />
        </section>
      ) : null}
    </main>
  )
}

export default App
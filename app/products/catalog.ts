export type ProductCategory = "Calls" | "Packages" | "Replacement Parts" | "Education";

export type Product = {
  id: string;
  name: string;
  price: string;
  storeUrl: string;
  image: string;
  category: ProductCategory;
};

const rows: Array<[string, string, string, string]> = [
  ["751638467","Antelope Talk Call","$15.99","https://elkinc.com/products/#!/ANTELOPE-TALK-CALL/p/751638467"],
  ["751639144","Antelope Talk w/ DVD Package Special","$35.99","https://elkinc.com/products/#!/*ANTELOPE-TALK-W-DVD-PACKAGE-SPECIAL/p/751639144"],
  ["751638454","Bears & Bear Hunters DVD","$25.99","https://elkinc.com/products/#!/BEARS-&-BEAR-HUNTERS-DVD/p/751638454"],
  ["751639161","Bugle Camo Cover","$7.99","https://elkinc.com/products/#!/BUGLE-CAMO-COVER/p/751639161"],
  ["751639126","Bustin' Coyotes DVD","$15.99","https://elkinc.com/products/#!/BUSTIN-COYOTES-DVD/p/751639126"],
  ["751638445","Call Carrying Lanyard","$7.99","https://elkinc.com/products/#!/CALL-CARRYING-LANYARD/p/751638445"],
  ["751638674","Cow Calling Instructional CD","$10.99","https://elkinc.com/products/#!/COW-CALLING-INSTRUCTIONAL-CD/p/751638674"],
  ["751639142","Cow Talk Elk Call","$15.99","https://elkinc.com/products/#!/COW-TALK-ELK-CALL/p/751639142"],
  ["751638704","Cow Talk Replacement Bands","$3.99","https://elkinc.com/products/#!/COW-TALK-REPLACEMENT-BANDS/p/751638704"],
  ["751638675","Cow Talk w/ DVD Package Special","$35.99","https://elkinc.com/products/#!/*COW-TALK-W-DVD-PACKAGE-SPECIAL/p/751638675"],
  ["751638456","Coyote Action DVD","$15.99","https://elkinc.com/products/#!/COYOTE-ACTION-DVD/p/751638456"],
  ["751639164","Coyote Hunter Book","$15.99","https://elkinc.com/products/#!/COYOTE-HUNTER-BOOK/p/751639164"],
  ["751639158","Coyote Tactics DVD","$15.99","https://elkinc.com/products/#!/COYOTE-TACTICS-DVD/p/751639158"],
  ["751638447","Deer Calling Instructional CD","$10.99","https://elkinc.com/products/#!/DEER-CALLING-INSTRUCTIONAL-CD/p/751638447"],
  ["751638450","Deer Talk Book","$17.99","https://elkinc.com/products/#!/DEER-TALK-BOOK/p/751638450"],
  ["751639143","Deer Talk Replacement Bands","$3.99","https://elkinc.com/products/#!/DEER-TALK-REPLACEMENT-BANDS/p/751639143"],
  ["751638443","Deer Talk — The Deer Stopper Call","$15.99","https://elkinc.com/products/#!/DEER-TALK-The-DEER-STOPPER-CALL/p/751638443"],
  ["751639125","Deer Talk w/ DVD Package","$35.99","https://elkinc.com/products/#!/*DEER-TALK-W-DVD-PACKAGE/p/751639125"],
  ["751638707","Dogging Coyotes DVD","$15.99","https://elkinc.com/products/#!/DOGGING-COYOTES-DVD/p/751638707"],
  ["751638700","Dogging Coyotes II DVD","$15.99","https://elkinc.com/products/#!/DOGGING-COYOTES-II-DVD/p/751638700"],
  ["751638688","Elk Calling… Sounds to Success DVD","$15.99","https://elkinc.com/products/#!/ELK-CALLING-SOUNDS-TO-SUCCESS-DVD/p/751638688"],
  ["751638687","Elk DVD","$15.99","https://elkinc.com/products/#!/ELK-DVD/p/751638687"],
  ["751639132","Elk Hunter Book","$17.99","https://elkinc.com/products/#!/ELK-HUNTER-BOOK/p/751639132"],
  ["751638711","Elk Tactics Book","$17.99","https://elkinc.com/products/#!/ELK-TACTICS-BOOK/p/751638711"],
  ["751638466","Elk Talk Book","$17.99","https://elkinc.com/products/#!/ELK-TALK-BOOK/p/751638466"],
  ["751638468","Foolin' Coyotes DVD","$15.99","https://elkinc.com/products/#!/FOOLIN-COYOTES-DVD/p/751638468"],
  ["751639136","Green Bands (Replace with Black Bands)","$4.99","https://elkinc.com/products/#!/GREEN-BANDS-Replace-with-Black-Bands/p/751639136"],
  ["751638439","How to Power Bugle Elk DVD","$15.99","https://elkinc.com/products/#!/HOW-TO-POWER-BUGLE-ELK-DVD/p/751638439"],
  ["751638691","How to Talk to the Antelope DVD","$15.99","https://elkinc.com/products/#!/HOW-TO-TALK-TO-THE-ANTELOPE-DVD/p/751638691"],
  ["751638461","How to Talk to the Deer DVD","$15.99","https://elkinc.com/products/#!/HOW-TO-TALK-TO-THE-DEER-DVD/p/751638461"],
  ["751638449","Hunting Coyotes DVD","$15.99","https://elkinc.com/products/#!/HUNTING-COYOTES-DVD/p/751638449"],
  ["751638706","In Search of Monster Whitetail DVD","$25.99","https://elkinc.com/products/#!/IN-SEARCH-OF-MONSTER-WHITETAIL-DVD/p/751638706"],
  ["751639154","Mini Grunt Tube","$20.99","https://elkinc.com/products/#!/MINI-GRUNT-TUBE/p/751639154"],
  ["751639145","Power Bands — Black","$4.99","https://elkinc.com/products/#!/POWER-BANDS-BLACK/p/751639145"],
  ["751638699","Power Bands — Gray","$4.99","https://elkinc.com/products/#!/POWER-BANDS-GRAY/p/751638699"],
  ["751638697","Power Bands — White","$4.99","https://elkinc.com/products/#!/POWER-BANDS-WHITE/p/751638697"],
  ["751638462","Power Bugle Pro Edition","$50.99","https://elkinc.com/products/#!/Power-Bugle-Pro-Edition/p/751638462"],
  ["751639135","Power Bugle Pro Edition Package Special","$63.99","https://elkinc.com/products/#!/*Power-Bugle-Pro-Edition-Package-Special/p/751639135"],
  ["751638444","Power Bugle Protective Cap","$8.99","https://elkinc.com/products/#!/POWER-BUGLE-PROTECTIVE-CAP/p/751638444"],
  ["751638440","Power Bugling Instructional CD","$10.99","https://elkinc.com/products/#!/POWER-BUGLING-INSTRUCTIONAL-CD/p/751638440"],
  ["751638709","Power Howler","$25.99","https://elkinc.com/products/#!/POWER-HOWLER/p/751638709"],
  ["751638696","Power Howler w/ DVD Package Special","$40.99","https://elkinc.com/products/#!/*POWER-HOWLER-W-DVD-PACKAGE-SPECIAL/p/751638696"],
  ["751638446","Power Howling Coyotes DVD","$15.99","https://elkinc.com/products/#!/POWER-HOWLING-COYOTES-DVD/p/751638446"],
  ["751638698","Royal Bugle Pro Edition","$50.99","https://elkinc.com/products/#!/Royal-Bugle-Pro-Edition/p/751638698"],
  ["751638678","Saskatchewan Giant Bucks DVD","$25.99","https://elkinc.com/products/#!/SASKATCHEWAN-GIANT-BUCKS-DVD/p/751638678"],
  ["751639131","Savage Wild DVD","$25.99","https://elkinc.com/products/#!/SAVAGE-WILD-DVD/p/751639131"],
  ["751638448","The Deer Hunter DVD","$25.99","https://elkinc.com/products/#!/THE-DEER-HUNTER-DVD/p/751638448"],
  ["751639129","The Wolf Howler","$50.99","https://elkinc.com/products/#!/THE-WOLF-HOWLER/p/751639129"],
  ["751638712","Western Deer Hunting DVD","$15.99","https://elkinc.com/products/#!/WESTERN-DEER-HUNTING-DVD/p/751638712"],
  ["751638689","Whitetail Country DVD","$25.99","https://elkinc.com/products/#!/WHITETAIL-COUNTRY-DVD/p/751638689"],
  ["751638686","Whitetail Hooker DVD","$25.99","https://elkinc.com/products/#!/WHITETAIL-HOOKER-DVD/p/751638686"],
  ["751639147","Yote Buster","$20.99","https://elkinc.com/products/#!/YOTE-BUSTER/p/751639147"],
  ["751638693","Yote Buster Replacement Reeds","$4.99","https://elkinc.com/products/#!/YOTE-BUSTER-REPLACEMENT-REEDS/p/751638693"],
  ["751639137","Yote Squeaker","$7.99","https://elkinc.com/products/#!/YOTE-SQUEAKER/p/751639137"],
];

function getCategory(name: string): ProductCategory {
  if (/PACKAGE/i.test(name)) return "Packages";
  if (/BAND|REED|CAP|COVER|LANYARD/i.test(name)) return "Replacement Parts";
  if (/DVD|BOOK|CD/i.test(name)) return "Education";
  return "Calls";
}

export const products: Product[] = rows.map(([id, name, price, storeUrl]) => ({
  id, name, price, storeUrl, image: `/products/${id}.jpg`, category: getCategory(name),
}));

export function getProduct(id: string) { return products.find((product) => product.id === id); }

export function getProductCopy(product: Product) {
  if (product.category === "Calls") return "A focused hunting-call product from the MT ELK Inc. line, presented for hunters who value practical equipment and authentic field tradition.";
  if (product.category === "Packages") return "A coordinated MT ELK package that brings complementary calling and instructional components together in one purchase.";
  if (product.category === "Replacement Parts") return "A purpose-built accessory or replacement component designed to help keep compatible MT ELK calling equipment field-ready.";
  return "An educational MT ELK resource created to support better preparation, calling knowledge, and confidence in the field.";
}

import { GenreTree } from "../../interfaces";

let genres: GenreTree = {
  Fiction: {
    Adventure: {
      name: "Adventure",
      parents: [],
      subgenres: []
    },
    "Alternative History": {
      name: "Alternative History",
      parents: [
        "Science Fiction"
      ],
      subgenres: []
    },
    Classics: {
      name: "Classics",
      parents: [],
      subgenres: []
    },
    "Comics & Graphic Novels": {
      name: "Comics & Graphic Novels",
      parents: [],
      subgenres: []
    },
    "Contemporary Romance": {
      name: "Contemporary Romance",
      parents: [
        "Romance"
      ],
      subgenres: []
    },
    "Cozy Mystery": {
      name: "Cozy Mystery",
      parents: [
        "Mystery"
      ],
      subgenres: []
    },
    "Crime & Detective Stories": {
      name: "Crime & Detective Stories",
      parents: [
        "Mystery"
      ],
      subgenres: []
    },
    Cyberpunk: {
      name: "Cyberpunk",
      parents: [
        "Science Fiction"
      ],
      subgenres: []
    },
    Drama: {
      name: "Drama",
      parents: [],
      subgenres: []
    },
    "Dystopian SF": {
      name: "Dystopian SF",
      parents: [
        "Science Fiction"
      ],
      subgenres: []
    },
    "Epic Fantasy": {
      name: "Epic Fantasy",
      parents: [
        "Fantasy"
      ],
      subgenres: []
    },
    Erotica: {
      name: "Erotica",
      parents: [],
      subgenres: []
    },
    Espionage: {
      name: "Espionage",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    Fantasy: {
      name: "Fantasy",
      parents: [],
      subgenres: [
        "Epic Fantasy",
        "Historical Fantasy",
        "Urban Fantasy"
      ]
    },
    Folklore: {
      name: "Folklore",
      parents: [],
      subgenres: []
    },
    "Ghost Stories": {
      name: "Ghost Stories",
      parents: [
        "Horror"
      ],
      subgenres: []
    },
    "Gothic Horror": {
      name: "Gothic Horror",
      parents: [
        "Horror"
      ],
      subgenres: []
    },
    "Gothic Romance": {
      name: "Gothic Romance",
      parents: [
        "Romance"
      ],
      subgenres: []
    },
    "Hard-Boiled Mystery": {
      name: "Hard-Boiled Mystery",
      parents: [
        "Mystery"
      ],
      subgenres: []
    },
    "Historical Fantasy": {
      name: "Historical Fantasy",
      parents: [
        "Fantasy"
      ],
      subgenres: []
    },
    "Historical Fiction": {
      name: "Historical Fiction",
      parents: [],
      subgenres: []
    },
    "Historical Mystery": {
      name: "Historical Mystery",
      parents: [
        "Mystery"
      ],
      subgenres: []
    },
    "Historical Romance": {
      name: "Historical Romance",
      parents: [
        "Romance"
      ],
      subgenres: []
    },
    "Historical Thriller": {
      name: "Historical Thriller",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    Horror: {
      name: "Horror",
      parents: [],
      subgenres: [
        "Gothic Horror",
        "Ghost Stories",
        "Vampires",
        "Werewolves",
        "Occult Horror"
      ]
    },
    "Humorous Fiction": {
      name: "Humorous Fiction",
      parents: [],
      subgenres: []
    },
    "LGBTQ Fiction": {
      name: "LGBTQ Fiction",
      parents: [],
      subgenres: []
    },
    "Legal Thriller": {
      name: "Legal Thriller",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    "Literary Fiction": {
      name: "Literary Fiction",
      parents: [],
      subgenres: []
    },
    "Media Tie-in SF": {
      name: "Media Tie-in SF",
      parents: [
        "Science Fiction"
      ],
      subgenres: []
    },
    "Medical Thriller": {
      name: "Medical Thriller",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    "Military SF": {
      name: "Military SF",
      parents: [
        "Science Fiction"
      ],
      subgenres: []
    },
    "Military Thriller": {
      name: "Military Thriller",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    Mystery: {
      name: "Mystery",
      parents: [],
      subgenres: [
        "Crime & Detective Stories",
        "Hard-Boiled Mystery",
        "Police Procedural",
        "Cozy Mystery",
        "Historical Mystery",
        "Paranormal Mystery",
        "Women Detectives"
      ]
    },
    "Occult Horror": {
      name: "Occult Horror",
      parents: [
        "Horror"
      ],
      subgenres: []
    },
    "Paranormal Mystery": {
      name: "Paranormal Mystery",
      parents: [
        "Mystery"
      ],
      subgenres: []
    },
    "Paranormal Romance": {
      name: "Paranormal Romance",
      parents: [
        "Romance"
      ],
      subgenres: []
    },
    Poetry: {
      name: "Poetry",
      parents: [],
      subgenres: []
    },
    "Police Procedural": {
      name: "Police Procedural",
      parents: [
        "Mystery"
      ],
      subgenres: []
    },
    "Political Thriller": {
      name: "Political Thriller",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    "Psychological Thriller": {
      name: "Psychological Thriller",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    "Religious Fiction": {
      name: "Religious Fiction",
      parents: [],
      subgenres: []
    },
    Romance: {
      name: "Romance",
      parents: [],
      subgenres: [
        "Contemporary Romance",
        "Gothic Romance",
        "Historical Romance",
        "Paranormal Romance",
        "Western Romance",
        "Romantic Suspense"
      ]
    },
    "Romantic SF": {
      name: "Romantic SF",
      parents: [
        "Science Fiction"
      ],
      subgenres: []
    },
    "Romantic Suspense": {
      name: "Romantic Suspense",
      parents: [
        "Romance"
      ],
      subgenres: []
    },
    "Science Fiction": {
      name: "Science Fiction",
      parents: [],
      subgenres: [
        "Dystopian SF",
        "Space Opera",
        "Cyberpunk",
        "Military SF",
        "Alternative History",
        "Steampunk",
        "Romantic SF",
        "Media Tie-in SF"
      ]
    },
    "Short Stories": {
      name: "Short Stories",
      parents: [],
      subgenres: []
    },
    "Space Opera": {
      name: "Space Opera",
      parents: [
        "Science Fiction"
      ],
      subgenres: []
    },
    Steampunk: {
      name: "Steampunk",
      parents: [
        "Science Fiction"
      ],
      subgenres: []
    },
    "Supernatural Thriller": {
      name: "Supernatural Thriller",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    "Suspense/Thriller": {
      name: "Suspense/Thriller",
      parents: [],
      subgenres: [
        "Historical Thriller",
        "Espionage",
        "Supernatural Thriller",
        "Medical Thriller",
        "Political Thriller",
        "Psychological Thriller",
        "Technothriller",
        "Legal Thriller",
        "Military Thriller"
      ]
    },
    Technothriller: {
      name: "Technothriller",
      parents: [
        "Suspense/Thriller"
      ],
      subgenres: []
    },
    "Urban Fantasy": {
      name: "Urban Fantasy",
      parents: [
        "Fantasy"
      ],
      subgenres: []
    },
    "Urban Fiction": {
      name: "Urban Fiction",
      parents: [],
      subgenres: []
    },
    Vampires: {
      name: "Vampires",
      parents: [
        "Horror"
      ],
      subgenres: []
    },
    Werewolves: {
      name: "Werewolves",
      parents: [
        "Horror"
      ],
      subgenres: []
    },
    "Western Romance": {
      name: "Western Romance",
      parents: [
        "Romance"
      ],
      subgenres: []
    },
    Westerns: {
      name: "Westerns",
      parents: [],
      subgenres: []
    },
    "Women Detectives": {
      name: "Women Detectives",
      parents: [
        "Mystery"
      ],
      subgenres: []
    },
    "Women's Fiction": {
      name: "Women's Fiction",
      parents: [],
      subgenres: []
    }
  },
  Nonfiction: {
    "African History": {
      name: "African History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    "Ancient History": {
      name: "Ancient History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    "Antiques & Collectibles": {
      name: "Antiques & Collectibles",
      parents: [
        "Hobbies & Home"
      ],
      subgenres: []
    },
    Architecture: {
      name: "Architecture",
      parents: [
        "Art & Design"
      ],
      subgenres: []
    },
    Art: {
      name: "Art",
      parents: [
        "Art & Design"
      ],
      subgenres: []
    },
    "Art & Design": {
      name: "Art & Design",
      parents: [],
      subgenres: [
        "Architecture",
        "Art",
        "Art Criticism & Theory",
        "Art History",
        "Design",
        "Fashion",
        "Photography"
      ]
    },
    "Art Criticism & Theory": {
      name: "Art Criticism & Theory",
      parents: [
        "Art & Design"
      ],
      subgenres: []
    },
    "Art History": {
      name: "Art History",
      parents: [
        "Art & Design"
      ],
      subgenres: []
    },
    "Asian History": {
      name: "Asian History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    "Bartending & Cocktails": {
      name: "Bartending & Cocktails",
      parents: [
        "Food & Health"
      ],
      subgenres: []
    },
    "Biography & Memoir": {
      name: "Biography & Memoir",
      parents: [],
      subgenres: []
    },
    "Body, Mind & Spirit": {
      name: "Body, Mind & Spirit",
      parents: [
        "Religion & Spirituality"
      ],
      subgenres: []
    },
    Buddhism: {
      name: "Buddhism",
      parents: [
        "Religion & Spirituality"
      ],
      subgenres: []
    },
    Business: {
      name: "Business",
      parents: [
        "Personal Finance & Business"
      ],
      subgenres: []
    },
    Christianity: {
      name: "Christianity",
      parents: [
        "Religion & Spirituality"
      ],
      subgenres: []
    },
    "Civil War History": {
      name: "Civil War History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    Computers: {
      name: "Computers",
      parents: [
        "Science & Technology"
      ],
      subgenres: []
    },
    Cooking: {
      name: "Cooking",
      parents: [
        "Food & Health"
      ],
      subgenres: []
    },
    "Crafts & Hobbies": {
      name: "Crafts & Hobbies",
      parents: [
        "Hobbies & Home"
      ],
      subgenres: []
    },
    Design: {
      name: "Design",
      parents: [
        "Art & Design"
      ],
      subgenres: []
    },
    Dictionaries: {
      name: "Dictionaries",
      parents: [
        "Reference & Study Aids"
      ],
      subgenres: []
    },
    Economics: {
      name: "Economics",
      parents: [
        "Personal Finance & Business"
      ],
      subgenres: []
    },
    Education: {
      name: "Education",
      parents: [],
      subgenres: []
    },
    Entertainment: {
      name: "Entertainment",
      parents: [],
      subgenres: [
        "Film & TV",
        "Music",
        "Performing Arts"
      ]
    },
    "European History": {
      name: "European History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    "Family & Relationships": {
      name: "Family & Relationships",
      parents: [
        "Parenting & Family"
      ],
      subgenres: []
    },
    Fashion: {
      name: "Fashion",
      parents: [
        "Art & Design"
      ],
      subgenres: []
    },
    "Film & TV": {
      name: "Film & TV",
      parents: [
        "Entertainment"
      ],
      subgenres: []
    },
    "Food & Health": {
      name: "Food & Health",
      parents: [],
      subgenres: [
        "Bartending & Cocktails",
        "Cooking",
        "Health & Diet",
        "Vegetarian & Vegan"
      ]
    },
    "Foreign Language Study": {
      name: "Foreign Language Study",
      parents: [
        "Reference & Study Aids"
      ],
      subgenres: []
    },
    Games: {
      name: "Games",
      parents: [
        "Hobbies & Home"
      ],
      subgenres: []
    },
    Gardening: {
      name: "Gardening",
      parents: [
        "Hobbies & Home"
      ],
      subgenres: []
    },
    "Health & Diet": {
      name: "Health & Diet",
      parents: [
        "Food & Health"
      ],
      subgenres: []
    },
    Hinduism: {
      name: "Hinduism",
      parents: [
        "Religion & Spirituality"
      ],
      subgenres: []
    },
    History: {
      name: "History",
      parents: [],
      subgenres: [
        "African History",
        "Ancient History",
        "Asian History",
        "Civil War History",
        "European History",
        "Latin American History",
        "Medieval History",
        "Middle East History",
        "Military History",
        "Modern History",
        "Renaissance & Early Modern History",
        "United States History",
        "World History"
      ]
    },
    "Hobbies & Home": {
      name: "Hobbies & Home",
      parents: [],
      subgenres: [
        "Antiques & Collectibles",
        "Crafts & Hobbies",
        "Gardening",
        "Games",
        "House & Home",
        "Pets"
      ]
    },
    "House & Home": {
      name: "House & Home",
      parents: [
        "Hobbies & Home"
      ],
      subgenres: []
    },
    "Humorous Nonfiction": {
      name: "Humorous Nonfiction",
      parents: [],
      subgenres: []
    },
    Islam: {
      name: "Islam",
      parents: [
        "Religion & Spirituality"
      ],
      subgenres: []
    },
    Judaism: {
      name: "Judaism",
      parents: [
        "Religion & Spirituality"
      ],
      subgenres: []
    },
    "Latin American History": {
      name: "Latin American History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    Law: {
      name: "Law",
      parents: [
        "Reference & Study Aids"
      ],
      subgenres: []
    },
    "Life Strategies": {
      name: "Life Strategies",
      parents: [],
      subgenres: []
    },
    "Literary Criticism": {
      name: "Literary Criticism",
      parents: [],
      subgenres: []
    },
    "Management & Leadership": {
      name: "Management & Leadership",
      parents: [
        "Personal Finance & Business"
      ],
      subgenres: []
    },
    Mathematics: {
      name: "Mathematics",
      parents: [
        "Science & Technology"
      ],
      subgenres: []
    },
    Medical: {
      name: "Medical",
      parents: [
        "Science & Technology"
      ],
      subgenres: []
    },
    "Medieval History": {
      name: "Medieval History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    "Middle East History": {
      name: "Middle East History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    "Military History": {
      name: "Military History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    "Modern History": {
      name: "Modern History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    Music: {
      name: "Music",
      parents: [
        "Entertainment"
      ],
      subgenres: []
    },
    Nature: {
      name: "Nature",
      parents: [
        "Science & Technology"
      ],
      subgenres: []
    },
    Parenting: {
      name: "Parenting",
      parents: [
        "Parenting & Family"
      ],
      subgenres: []
    },
    "Parenting & Family": {
      name: "Parenting & Family",
      parents: [],
      subgenres: [
        "Family & Relationships",
        "Parenting"
      ]
    },
    "Performing Arts": {
      name: "Performing Arts",
      parents: [
        "Entertainment"
      ],
      subgenres: []
    },
    Periodicals: {
      name: "Periodicals",
      parents: [],
      subgenres: []
    },
    "Personal Finance & Business": {
      name: "Personal Finance & Business",
      parents: [],
      subgenres: [
        "Business",
        "Economics",
        "Management & Leadership",
        "Personal Finance & Investing",
        "Real Estate"
      ]
    },
    "Personal Finance & Investing": {
      name: "Personal Finance & Investing",
      parents: [
        "Personal Finance & Business"
      ],
      subgenres: []
    },
    Pets: {
      name: "Pets",
      parents: [
        "Hobbies & Home"
      ],
      subgenres: []
    },
    Philosophy: {
      name: "Philosophy",
      parents: [],
      subgenres: []
    },
    Photography: {
      name: "Photography",
      parents: [
        "Art & Design"
      ],
      subgenres: []
    },
    "Political Science": {
      name: "Political Science",
      parents: [],
      subgenres: []
    },
    Psychology: {
      name: "Psychology",
      parents: [
        "Science & Technology"
      ],
      subgenres: []
    },
    "Real Estate": {
      name: "Real Estate",
      parents: [
        "Personal Finance & Business"
      ],
      subgenres: []
    },
    "Reference & Study Aids": {
      name: "Reference & Study Aids",
      parents: [],
      subgenres: [
        "Dictionaries",
        "Foreign Language Study",
        "Law",
        "Study Aids"
      ]
    },
    "Religion & Spirituality": {
      name: "Religion & Spirituality",
      parents: [],
      subgenres: [
        "Body, Mind & Spirit",
        "Buddhism",
        "Christianity",
        "Hinduism",
        "Islam",
        "Judaism"
      ]
    },
    "Renaissance & Early Modern History": {
      name: "Renaissance & Early Modern History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    Science: {
      name: "Science",
      parents: [
        "Science & Technology"
      ],
      subgenres: []
    },
    "Science & Technology": {
      name: "Science & Technology",
      parents: [],
      subgenres: [
        "Computers",
        "Mathematics",
        "Medical",
        "Nature",
        "Psychology",
        "Science",
        "Social Sciences",
        "Technology"
      ]
    },
    "Self-Help": {
      name: "Self-Help",
      parents: [],
      subgenres: []
    },
    "Social Sciences": {
      name: "Social Sciences",
      parents: [
        "Science & Technology"
      ],
      subgenres: []
    },
    Sports: {
      name: "Sports",
      parents: [],
      subgenres: []
    },
    "Study Aids": {
      name: "Study Aids",
      parents: [
        "Reference & Study Aids"
      ],
      subgenres: []
    },
    Technology: {
      name: "Technology",
      parents: [
        "Science & Technology"
      ],
      subgenres: []
    },
    Travel: {
      name: "Travel",
      parents: [],
      subgenres: []
    },
    "True Crime": {
      name: "True Crime",
      parents: [],
      subgenres: []
    },
    "United States History": {
      name: "United States History",
      parents: [
        "History"
      ],
      subgenres: []
    },
    "Vegetarian & Vegan": {
      name: "Vegetarian & Vegan",
      parents: [
        "Food & Health"
      ],
      subgenres: []
    },
    "World History": {
      name: "World History",
      parents: [
        "History"
      ],
      subgenres: []
    }
  }
};

export default genres;
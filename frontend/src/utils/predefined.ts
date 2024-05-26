import { HashSet } from "effect"
import { TagFilter, TagFilterDefault } from "../models/TagFilter"

export const technologies = HashSet.fromIterable([
    TagFilterDefault("React"),
    TagFilterDefault("Python"),
    TagFilterDefault("Typescript"),
    TagFilterDefault("NodeJS"),
    TagFilterDefault("JavaScript"),
    TagFilterDefault("Go"),
    TagFilterDefault("Ruby"),
    TagFilterDefault("Kubernetes"),
    TagFilterDefault("Java"),
    TagFilterDefault("Ruby on Rails"),
    TagFilterDefault("iOS"),
    TagFilterDefault("Android"),
    TagFilter({name: "C++", pattern: RegExp(/(^|\b|\s)(C\+\+[0-9]{0,2})($|\W|\s)/, "gmi")}),
    TagFilterDefault("React Native"),
    TagFilterDefault("Rust"),
    TagFilterDefault("Angular"),
    TagFilterDefault("VueJS"),
    TagFilterDefault("PHP"),
    TagFilterDefault(".NET"),
    TagFilterDefault("C#"),
    TagFilterDefault("Kotlin"),
    TagFilter({name: "Scala", pattern: RegExp(/(^|\b|\s)(Scala[0-9]{0,1})($|\b|\s)/, "gmi")}),
    TagFilterDefault("Kafka"),
    TagFilterDefault("Swift"),
    TagFilterDefault("Elixir"),
    TagFilter({name: "C", pattern: RegExp(/(^|\b|\s)(C)($|\b|\s|^\+|^#)/, "gm")}),
    TagFilterDefault("Next.js"),
    TagFilterDefault("Clojure"),
    TagFilterDefault("Tensorflow"),
    TagFilterDefault("Haskell"),
    TagFilterDefault("EmberJS"),
    TagFilterDefault("Dart"),
    TagFilterDefault("Flutter"),
    TagFilterDefault("Snowflake"),
    TagFilterDefault("WebAssembly"),
    TagFilterDefault("Julia"),
    TagFilterDefault("Elm"),
    TagFilterDefault("Perl"),
    TagFilterDefault("Clickhouse"),
    TagFilterDefault("Ocaml"),
    TagFilterDefault("Svelte"),
    TagFilterDefault("Lua"),
    TagFilterDefault("AWS"),
    TagFilterDefault("Firebase"),
])

export const locations = HashSet.fromIterable([
    TagFilterDefault("Remote"),
    TagFilter({name: "San Francisco / SF", pattern: RegExp(/(^|\b|\s)(San Francisco|SF)($|\b|\s)/, "gmi")}),
    TagFilterDefault("New York City"),
    TagFilterDefault("London"),
    TagFilterDefault("Boston"),
    TagFilterDefault("Berlin"),
    TagFilterDefault("Los Angeles"),
    TagFilterDefault("Seattle"),
    TagFilterDefault("Austin"),
    TagFilterDefault("Toronto"),
    TagFilterDefault("Amsterdam"),
    TagFilterDefault("Chicago"),
    TagFilterDefault("DC"),
    TagFilterDefault("Paris"),
    TagFilterDefault("Palo Alto"),
    TagFilterDefault("Cambridge (MA)"),
    TagFilterDefault("Munich"),
    TagFilterDefault("Vancouver"),
    TagFilterDefault("Denver"),
    TagFilterDefault("Singapore"),
    TagFilterDefault("Atlanta"),
    TagFilterDefault("San Diego"),
    TagFilterDefault("Bangalore"),
    TagFilterDefault("Montreal"),
    TagFilterDefault("Mountain View"),
    TagFilterDefault("Philadelphia"),
    TagFilterDefault("Boulder"),
    TagFilterDefault("San Mateo"),
    TagFilterDefault("Portland"),
    TagFilterDefault("Sydney"),
    TagFilterDefault("Berkeley"),
    TagFilterDefault("Tokyo"),
    TagFilterDefault("Oakland"),
    TagFilterDefault("Zurich"),
    TagFilterDefault("Barcelona"),
    TagFilterDefault("Brooklyn"),
    TagFilterDefault("Dublin"),
    TagFilterDefault("Pittsburgh"),
    TagFilterDefault("Redwood City"),
    TagFilterDefault("Oslo"),
    TagFilterDefault("Hong Kong"),
    TagFilterDefault("Lisbon"),
    TagFilterDefault("Dallas"),
    TagFilterDefault("San Jose"),
    TagFilterDefault("Edinburgh"),
    TagFilterDefault("Budapest"),
    TagFilterDefault("Sunnyvale"),
    TagFilterDefault("Menlo Park"),
    TagFilterDefault("Salt Lake City"),
    TagFilterDefault("Houston"),
    TagFilterDefault("Warsaw"),
    TagFilterDefault("Cambridge (UK)"),
    TagFilterDefault("Melbourne (FL)"),
    TagFilterDefault("Melbourne (AU)"),
    TagFilterDefault("Ann Arbor"),
    TagFilterDefault("Madrid"),
    TagFilterDefault("Durham"),
    TagFilterDefault("Oxford"),
    TagFilterDefault("Prague"),
    TagFilterDefault("Charlotte"),
    TagFilterDefault("Raleigh"),
    TagFilterDefault("Pune"),
    TagFilterDefault("Detroit"),
    TagFilterDefault("Princeton"),
    TagFilterDefault("Irvine"),
    TagFilterDefault("Cologne"),
    TagFilterDefault("Bangkok"),
    TagFilterDefault("Cupertino"),
    TagFilterDefault("Shanghai"),
    TagFilterDefault("Shenzhen"),
    TagFilterDefault("Ghent"),
    TagFilterDefault("Hyderabad"),
    TagFilterDefault("Dubai"),
    TagFilterDefault("Eindhoven"),
    TagFilterDefault("Chennai"),
    TagFilterDefault("Lausanne"),
    TagFilterDefault("Burlingame"),
    TagFilterDefault("Sao Paulo"),
    TagFilterDefault("Beijing"),
    TagFilterDefault("Seoul"),
    TagFilterDefault("Auckland"),
    TagFilterDefault("Tampa"),
    TagFilterDefault("Mexico City"),
    TagFilterDefault("Emeryville"),
    TagFilterDefault("Phoenix (AZ)"),
    TagFilterDefault("Cape Town"),
    TagFilterDefault("Kansas City"),
    TagFilterDefault("Leuven"),
    TagFilterDefault("Brussels"),
    TagFilterDefault("Trondheim"),
    TagFilterDefault("Guadalajara"),
    TagFilterDefault("Lincoln"),
    TagFilterDefault("Wellington"),
    TagFilterDefault("Tucson"),
    TagFilterDefault("Manila"),
    TagFilterDefault("Los Gatos"),
    TagFilterDefault("Antwerp"),
    TagFilterDefault("Bogotá"),
    TagFilterDefault("San Ramon"),
    TagFilterDefault("Knoxville"),
    TagFilterDefault("Hangzhou"),
    TagFilterDefault("Bratislava"),
    TagFilterDefault("Braga"),
    TagFilterDefault("Geneve"),
])

export const role = HashSet.fromIterable([
    TagFilter({name: "Developer / Engineer", pattern: RegExp(/(^|\b|\s)(Developer|Engineer)($|\b|\s)/, "gmi")}),
    TagFilterDefault("Developer"),
    TagFilterDefault("Product Manager"),
    TagFilterDefault("Data Scientist"),
    TagFilterDefault("Machine Learning"),
    TagFilterDefault("AI Engineer"),
    TagFilterDefault("Software Engineer"),
    TagFilterDefault("Founding Engineer"),
    TagFilterDefault("Infrastructure Engineer"),
    TagFilterDefault("Manager"),
    TagFilterDefault("Lead"),
    TagFilterDefault("Staff"),
    TagFilter({name: "Senior / Sr", pattern: RegExp(/(^|\b|\s)(Senior|Sr)($|\b|\s)/, "gmi")}),
    TagFilterDefault("Junior"),
    TagFilterDefault("Backend"),
    TagFilterDefault("Frontend"),
    TagFilterDefault("Principal"),
])

export const misc = HashSet.fromIterable([
    TagFilterDefault("Diversity"),
    TagFilterDefault("Equity"),
    TagFilterDefault("Inclusion"),
    TagFilter({name: "Full-Time", pattern: RegExp(/(^|\b|\s)(full.{0,2}time)($|\b|\s)/, "gmi")}),
    TagFilter({name: "Full-Stack", pattern: RegExp(/(^|\b|\s)(full.{0,2}stack)($|\b|\s)/, "gmi")}),
])
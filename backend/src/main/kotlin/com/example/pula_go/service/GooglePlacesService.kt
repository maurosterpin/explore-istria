package com.example.pula_go.service

import com.example.pula_go.model.Attraction
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class GooglePlacesService(
    @Value("\${google.api.key}") private val apiKey: String,
    @Value("\${radius}") private val radius: String
) {
    private val webClient = WebClient.create("https://maps.googleapis.com")

    data class PlacesResponse(
        val results: List<Place>,
        val status: String,
        val next_page_token: String? = null
    )
    data class Place(
        val name: String,
        val place_id: String,
        val geometry: Geometry,
        val photos: List<Photo>? = null
    )
    data class Geometry(val location: Location)
    data class Location(val lat: Double, val lng: Double)
    data class Photo(
        val photo_reference: String,
        val height: Int?,
        val width: Int?,
        val html_attributions: List<String>?
    )

    data class PlaceDetailsResponse(
        val result: PlaceDetails,
        val status: String
    )
    data class PlaceDetails(
        val editorial_summary: EditorialSummary?,
        val photos: List<Photo>?
    )
    data class EditorialSummary(
        val overview: String?
    )

    private val gridPoints = listOf(
        Pair(45.3167000, 14.0000000)
    )

    private val cityCenters = listOf(
        Pair(45.3156571, 13.5619471), // Novigrad :contentReference[oaicite:0]{index=0}
        Pair(45.0950000, 14.1197194), // Labin :contentReference[oaicite:1]{index=1}
        Pair(45.4094389, 13.9666694), // Buzet :contentReference[oaicite:2]{index=2}
        Pair(45.4100000, 13.6619389), // Buje :contentReference[oaicite:3]{index=3}
        Pair(44.9589555, 13.8513371), // Vodnjan :contentReference[oaicite:4]{index=4}
        Pair(45.2402806, 13.9366694),  // Pazin :contentReference[oaicite:5]{index=5}

        Pair(45.0683000, 13.6419000), // Bale :contentReference[oaicite:0]{index=0}
        Pair(45.1624000, 14.0388000), // Barban :contentReference[oaicite:1]{index=1}
        Pair(45.3469000, 13.6436000), // Brtonigla :contentReference[oaicite:2]{index=2}
        Pair(45.3167000, 14.0000000), // Cerovlje :contentReference[oaicite:3]{index=3}
        Pair(44.8674000, 13.8399000), // Fažana :contentReference[oaicite:4]{index=4}
        Pair(45.2067000, 13.6069000), // Funtana :contentReference[oaicite:5]{index=5}
        Pair(45.3178000, 13.9486000), // Gračišće :contentReference[oaicite:6]{index=6}
        Pair(45.3505000, 13.5883000), // Grožnjan :contentReference[oaicite:7]{index=7}
        Pair(45.1933000, 13.8199000), // Kanfanar :contentReference[oaicite:8]{index=8}
        Pair(45.3292000, 13.8586000), // Karojba :contentReference[oaicite:9]{index=9}
        Pair(45.2313000, 13.8190000), // Kaštelir-Labinci :contentReference[oaicite:10]{index=10}
        Pair(45.1837000, 14.0551000), // Kršan :contentReference[oaicite:11]{index=11}
        Pair(45.3384000, 13.9755000), // Lanišće :contentReference[oaicite:12]{index=12}
        Pair(44.8277000, 13.9956000), // Ližnjan :contentReference[oaicite:13]{index=13}
        Pair(45.3033000, 13.9813000), // Lupoglav :contentReference[oaicite:14]{index=14}
        Pair(44.8826000, 14.1352000), // Marčana :contentReference[oaicite:15]{index=15}
        Pair(44.8276000, 13.9497000), // Medulin :contentReference[oaicite:16]{index=16}
        Pair(45.3239000, 13.9186000), // Motovun :contentReference[oaicite:17]{index=17}
        Pair(45.3307000, 13.6785000), // Oprtalj :contentReference[oaicite:18]{index=18}
        Pair(45.2853000, 14.0043000), // Pićan :contentReference[oaicite:19]{index=19}
        Pair(45.1253000, 14.0701000), // Raša :contentReference[oaicite:20]{index=20}
        Pair(45.3169000, 13.9226000), // Sveta Nedelja :contentReference[oaicite:21]{index=21}
        Pair(45.1978000, 13.8484000), // Sveti Lovreč :contentReference[oaicite:22]{index=22}
        Pair(45.2060000, 13.8854000), // Sveti Petar u Šumi :contentReference[oaicite:23]{index=23}
        Pair(45.1486000, 13.8914000), // Svetvinčenat :contentReference[oaicite:24]{index=24}
        Pair(45.1871000, 13.5818000), // Tar-Vabriga :contentReference[oaicite:25]{index=25}
        Pair(45.3196000, 13.9640000), // Tinjan :contentReference[oaicite:26]{index=26}
        Pair(45.2800000, 13.5980000), // Višnjan :contentReference[oaicite:27]{index=27}
        Pair(45.1974000, 13.6673000), // Vižinada :contentReference[oaicite:28]{index=28}
        Pair(45.2059000, 13.5887000), // Vrsar :contentReference[oaicite:29]{index=29}
        Pair(45.1809000, 13.9622000)  // Žminj :contentReference[oaicite:30]{index=30}
    )

    private fun fetchAttractionDetails(placeId: String): Pair<String?, String?> {
        val detailsUrl = "/maps/api/place/details/json?place_id=$placeId&fields=editorial_summary,photos&key=$apiKey"
        val detailsResponse = webClient.get()
            .uri(detailsUrl)
            .retrieve()
            .bodyToMono(PlaceDetailsResponse::class.java)
            .block()

        if (detailsResponse?.status == "OK") {
            val description = detailsResponse.result.editorial_summary?.overview
            val imageUrl = detailsResponse.result.photos?.firstOrNull()?.let { photo ->
                "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=$apiKey"
            }
            return Pair(description, imageUrl)
        }
        return Pair(null, null)
    }

    fun fetchAllAttractions(): List<Attraction> {
        val attractionsMap = mutableMapOf<String, Attraction>()

        for ((lat, lng) in gridPoints) {
            var url = "/maps/api/place/nearbysearch/json?location=$lat,$lng&radius=5000&type=tourist_attraction&key=$apiKey"
            do {
                val response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(PlacesResponse::class.java)
                    .block()

                if (response?.status == "OK") {
                    response.results.forEach { place ->
                        if (!attractionsMap.containsKey(place.place_id)) {
                            // val (description, imageUrl) = fetchAttractionDetails(place.place_id)
                            val attraction = Attraction(
                                name = place.name,
                                lat = place.geometry.location.lat,
                                lng = place.geometry.location.lng,
                                description = "",
                                imageUrl = "",
                                city = "Cerovlje",
                                rating = 5.0,

                            )
                            attractionsMap[place.place_id] = attraction
                        }
                    }
                    if (response.next_page_token != null) {
                        Thread.sleep(2000)
                        url = "/maps/api/place/nearbysearch/json?pagetoken=${response.next_page_token}&key=$apiKey"
                    } else {
                        break
                    }
                } else {
                    break
                }
            } while (true)
        }
        return attractionsMap.values.toList()
    }
}

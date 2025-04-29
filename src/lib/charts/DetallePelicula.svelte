<script>
  export let data;
</script>
  
{#if data}
  <div>
    <h2>{data.primaryTitle}</h2>
    <p><strong>Género:</strong> {data.genres}</p>
    <p><strong>Rating:</strong> {data.averageRating}</p>
    <p><strong>Director:</strong> {data.directors}</p>
    <p><strong>Nominaciones al Oscar:</strong> {data.oscarNominations}</p>
    <p><strong>Premios al Oscar:</strong> {data.oscarWins}</p>
    <p><strong>Año de estreno:</strong> {data.startYear}</p>
  </div>
{/if}
  
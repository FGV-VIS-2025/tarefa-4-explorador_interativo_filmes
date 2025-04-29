<script>
    export let data;
</script>
  
{#if data}
  <div>
    <h2>{data.primaryTitle}</h2>
    <p><strong>Genre:</strong> {data.genres}</p>
    <p><strong>Rating:</strong> {data.averageRating}</p>
    <p><strong>Director:</strong> {data.directors}</p>
    <p><strong>Oscars nominations:</strong> {data.oscarNominations}</p>
    <p><strong>Oscars wins:</strong> {data.oscarWins}</p>
    <p><strong>Release year:</strong> {data.startYear}</p>
  </div>
{/if}
  
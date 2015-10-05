$(function(){
  var $seoContainer = $('#seo-trustbox');  
  var seoUrl = 'https://productreviewswidgets.trustpilot.com';
  /*  sku={sku}
      contentLanguage={contentLanguage}
      businessUnitId={buid}
      apikey={apikey}
      productName={productName}
      perPage={perPage}
      count={count}
      locale={locale}
      widgetHeight={widgetHeight}
  */
  
  $.ajax({
    url: '/seo',
    dataType: 'text/html',
    cache: false,
    complete: function(response){
      $seoContainer.append(response.responseText);
    }
  });
});

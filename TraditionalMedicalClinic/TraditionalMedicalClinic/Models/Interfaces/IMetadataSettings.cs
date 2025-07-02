namespace TraditionalMedicalClinic.Models.Interfaces
{
    public interface IMetadataSettings
    {
        string MetaDataWithinTheHeadTag { get; set; }
        string BrowserTitle { get; set; }
        string Keywords { get; set; }
        string Description { get; set; }
        string ExtendedMetaTags { get; set; }
        ContentReference OpenGraphImage { get; set; }
        bool DisableIndexing { get; set; }
    }
}
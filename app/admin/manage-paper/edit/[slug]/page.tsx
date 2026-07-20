"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditPaper() {
  const router = useRouter();
  const params = useParams(); // params.slug is available here as a string
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    links: [{ label: "", url: "" }], // Updated to use the links array
    coverImageUrl: "",
    focusKeywords: "",
    metaDescription: "",
    fullDetails: "", 
  });

  // Fetch the existing paper data on load
  useEffect(() => {
    setIsFetching(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/papers/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          category: data.category || "",
          // Load existing links, or provide one empty row if the array is missing/empty
          links: data.links && data.links.length > 0 ? data.links : [{ label: "", url: "" }],
          coverImageUrl: data.coverImageUrl || "",
          focusKeywords: data.focusKeywords || "",
          metaDescription: data.metaDescription || "",
          fullDetails: data.fullDetails || "",
        });
        setIsFetching(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to fetch document data.");
        setIsFetching(false);
      });
  }, [params.slug]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData({
      ...formData,
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Dynamic Link Handlers ---
  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index][field] = value;
    setFormData({ ...formData, links: updatedLinks });
  };

  const addLink = () => {
    setFormData({ ...formData, links: [...formData.links, { label: "", url: "" }] });
  };

  const removeLink = (index: number) => {
    const updatedLinks = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: updatedLinks });
  };
  // -----------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use PUT request and the ORIGINAL slug from the URL to update the document
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/papers/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/");
      } else {
        const errorData = await res.json();
        alert(`Failed to update: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("Something went wrong while updating.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show a loading screen while fetching data
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 font-medium animate-pulse text-lg">
          Loading document data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Sticky Header with Actions */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 sm:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Edit Document</h1>
          <p className="text-sm text-gray-500 font-medium">Updating: <span className="text-blue-600">{params.slug}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => router.push("/")} 
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <span className="animate-pulse">Updating...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Update Document
              </>
            )}
          </button>
        </div>
      </div>

      <form className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 mt-4">
        
        {/* TOP ROW: Core Info & SEO (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Core Information Card */}
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-600 rounded-md"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
              Core Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Document Title *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleTitleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Slug *</label>
                  <input type="text" name="slug" required value={formData.slug} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                  <input type="text" name="category" required value={formData.category} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>

              {/* Dynamic Multiple Links Section */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Download / Resource Links *</label>
                
                <div className="space-y-3">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input 
                          type="text" 
                          required 
                          value={link.label} 
                          onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="Label (e.g., Part 1 PDF)" 
                        />
                        <input 
                          type="url" 
                          required 
                          value={link.url} 
                          onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                          className="w-full sm:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="https://example.com/file.pdf" 
                        />
                      </div>
                      
                      {/* Only show remove button if there is more than 1 link */}
                      {formData.links.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeLink(index)}
                          className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                          title="Remove Link"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button 
                  type="button" 
                  onClick={addLink}
                  className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  Add Another Link
                </button>
              </div>

            </div>
          </div>

          {/* Media & SEO Card */}
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="p-1.5 bg-purple-100 text-purple-600 rounded-md"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span>
                Media & Discovery
              </h2>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL</label>
              <input type="url" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>

            <div className="space-y-5 border-t border-gray-100 pt-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Focus Keywords</label>
                <input type="text" name="focusKeywords" value={formData.focusKeywords} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Description</label>
                <textarea name="metaDescription" rows={2} value={formData.metaDescription} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: HTML Content with Live Preview */}
        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-orange-100 text-orange-600 rounded-md"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></span>
              Rich HTML Content
            </h2>
            <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-500 rounded-full">Live Preview Active</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
            
            {/* HTML Editor Pane */}
            <div className="flex flex-col h-full">
              <label className="text-sm font-bold text-gray-700 mb-2">HTML Source</label>
              <textarea 
                name="fullDetails" 
                value={formData.fullDetails} 
                onChange={handleChange}
                className="w-full flex-grow font-mono text-sm p-5 border border-gray-800 rounded-xl bg-gray-900 text-green-400 focus:ring-2 focus:ring-orange-500 outline-none resize-none shadow-inner custom-scrollbar"
              />
            </div>

            {/* Live Render Pane */}
            <div className="flex flex-col h-full">
              <label className="text-sm font-bold text-gray-700 mb-2">Live Result</label>
              <div className="w-full flex-grow p-6 border border-gray-200 rounded-xl bg-white overflow-y-auto shadow-inner relative">
                {formData.fullDetails ? (
                  /* 
                    REPLACED the failing prose class with strict arbitrary Tailwind variants. 
                    This guarantees standard HTML styles (margins, lists, tables, bold text) 
                    will work perfectly regardless of your tailwind config plugins!
                  */
                  <div 
                    className="w-full max-w-none text-gray-800
                      [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:mb-5 [&_h1]:mt-8 [&_h1]:text-gray-900
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-gray-900
                      [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-gray-900
                      [&_p]:mb-4 [&_p]:leading-relaxed 
                      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul_li]:mb-1.5
                      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol_li]:mb-1.5
                      [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800
                      [&_table]:w-full [&_table]:mb-6 [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300
                      [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold
                      [&_td]:border [&_td]:border-gray-300 [&_td]:p-3
                      [&_hr]:my-6 [&_hr]:border-gray-200
                      [&_strong]:font-bold [&_strong]:text-gray-900
                      [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: formData.fullDetails }} 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">
                    Live HTML preview will appear here...
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
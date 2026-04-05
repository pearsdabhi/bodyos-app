
import React, { useState, useRef } from 'react';
import { Upload, MoreHorizontal } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  date: string;
}

// Using fitness-themed placeholders
const mockPhotos: Photo[] = [
    { id: '1', url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=800&q=60', date: 'Jul 8, 2025' },
    { id: '2', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60', date: 'Nov 25, 2022' },
    { id: '3', url: 'https://images.unsplash.com/photo-1574680096145-f844349f815b?auto=format&fit=crop&w=800&q=60', date: 'Nov 24, 2022' },
    { id: '4', url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=60', date: 'Nov 21, 2022' },
    { id: '5', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=60', date: 'Nov 20, 2022' },
    { id: '6', url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=60', date: 'Nov 18, 2022' },
    { id: '7', url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=60', date: 'Nov 14, 2022' },
    { id: '8', url: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=800&q=60', date: 'Nov 12, 2022' },
];

const ProgressPhotos: React.FC = () => {
    const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newPhoto: Photo = {
                    id: Date.now().toString(),
                    url: event.target?.result as string,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                };
                setPhotos(prev => [newPhoto, ...prev]);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">Progress Photos</h2>
                <button
                    onClick={handleUploadClick}
                    className="px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                    <Upload size={16}/> Upload Photo
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map(photo => (
                    <div key={photo.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-3 shadow-xl group transition-all hover:border-cyan-500/30">
                        <div className="aspect-[3/4] rounded-[1.5rem] overflow-hidden mb-4">
                            <img src={photo.url} alt={`Progress on ${photo.date}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div className="flex justify-between items-center px-2 pb-2">
                            <p className="text-xs font-bold text-slate-400">{photo.date}</p>
                            <button className="text-slate-600 hover:text-white">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressPhotos;

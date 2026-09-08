import { useState, useRef, useEffect } from 'react'
import {
  Upload,
  Camera,
  AlertCircle,
  Plus,
  Loader2,
  ImageIcon,
  X,
  Sparkles,
  Check,
  Utensils,
  Clock,
  Trash2
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/Input'

export default function FoodAnalyzer() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logging, setLogging] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadFoodHistory()
  }, [])

  const loadFoodHistory = async () => {
    setHistoryLoading(true)
    try {
      const { data } = await api.get('/api/food/history')
      if (Array.isArray(data?.logs)) {
        setHistory(data.logs)
      }
    } catch (err) {
      console.error('Food history error:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WebP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 10MB.')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setAnalysis(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const analyzeFood = async () => {
    if (!image) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      const { data } = await api.post('/api/food/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAnalysis(data.analysis)
      toast.success('Food photo analyzed!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Please try a clearer image.')
    } finally {
      setLoading(false)
    }
  }

  const logFood = async (mealType = 'lunch') => {
    if (!analysis) return
    setLogging(true)
    try {
      await api.post('/api/food/log', {
        food_items: analysis.food_items,
        calories: analysis.totals?.calories || 0,
        protein_g: analysis.totals?.protein_g || 0,
        carbs_g: analysis.totals?.carbs_g || 0,
        fat_g: analysis.totals?.fat_g || 0,
        meal_type: mealType,
      })
      toast.success('Meal added to daily log!')
      loadFoodHistory()
      clear()
    } catch (err) {
      toast.error('Failed to log food')
    } finally {
      setLogging(false)
    }
  }

  const clear = () => {
    setImage(null)
    setPreview(null)
    setAnalysis(null)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Food Vision & Nutrition Logger"
        description="Upload or snap a photo of your meal to automatically estimate calories and macronutrients using AI."
        badge={<Badge variant="emerald">Vision AI</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Analysis Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan Food Photo</CardTitle>
            </CardHeader>
            <CardContent>
              {!preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-colors group bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to select or drag and drop image
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    Supports JPEG, PNG, WebP up to 10MB
                  </p>
                  <Button variant="secondary" size="sm" icon={Upload}>
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={preview}
                      alt="Uploaded food"
                      className="w-full max-h-80 object-cover"
                    />
                    <button
                      onClick={clear}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={analyzeFood}
                      loading={loading}
                      className="flex-1"
                      icon={Sparkles}
                    >
                      {loading ? 'Analyzing with Gemini Vision...' : 'Analyze Nutrition'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card className="animate-fade-in border-emerald-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Nutritional Breakdown</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Estimated portions and macronutrient distribution
                  </p>
                </div>
                <Badge variant={analysis.confidence === 'high' ? 'success' : 'warning'}>
                  {analysis.confidence || 'estimated'} confidence
                </Badge>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Food Items Detected */}
                {Array.isArray(analysis.food_items) && analysis.food_items.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Detected Items
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.food_items.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {item.name} {item.portion ? `· ${item.portion}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Macro summary grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30">
                    <p className="text-xs text-orange-800 dark:text-orange-400 font-medium">Calories</p>
                    <p className="text-xl font-bold text-orange-950 dark:text-orange-200 mt-0.5">
                      {Math.round(analysis.totals?.calories || 0)} <span className="text-xs font-normal">kcal</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                    <p className="text-xs text-blue-800 dark:text-blue-400 font-medium">Protein</p>
                    <p className="text-xl font-bold text-blue-950 dark:text-blue-200 mt-0.5">
                      {Math.round(analysis.totals?.protein_g || 0)} <span className="text-xs font-normal">g</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">Carbohydrates</p>
                    <p className="text-xl font-bold text-amber-950 dark:text-amber-200 mt-0.5">
                      {Math.round(analysis.totals?.carbs_g || 0)} <span className="text-xs font-normal">g</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/30">
                    <p className="text-xs text-purple-800 dark:text-purple-400 font-medium">Fats</p>
                    <p className="text-xl font-bold text-purple-950 dark:text-purple-200 mt-0.5">
                      {Math.round(analysis.totals?.fat_g || 0)} <span className="text-xs font-normal">g</span>
                    </p>
                  </div>
                </div>

                {analysis.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {analysis.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => logFood('meal')}
                    loading={logging}
                    icon={Plus}
                    className="w-full"
                  >
                    Confirm & Add to Today's Food Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Meal History Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent Food Logs</CardTitle>
              <Utensils className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No meals logged today yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.slice(0, 5).map((log, i) => (
                    <div key={i} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                          {log.meal_type || 'Meal'}
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                          {log.calories} kcal
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        P: {log.protein_g || 0}g · C: {log.carbs_g || 0}g · F: {log.fat_g || 0}g
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
